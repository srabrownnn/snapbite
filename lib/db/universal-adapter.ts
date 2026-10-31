/**
 * Universal Database Adapter for SnapBite
 * 
 * Supports ANY database platform:
 * 1. PostgreSQL (Neon, Railway, Supabase, AWS RDS, DigitalOcean, Docker, Vercel Postgres)
 *    -> Detected via process.env.DATABASE_URL or process.env.POSTGRES_URL
 * 
 * 2. MongoDB (MongoDB Atlas, Railway, Docker, Local MongoDB)
 *    -> Detected via process.env.MONGODB_URI or process.env.MONGODB_URL
 * 
 * 3. In-Memory / File System Fallback
 *    -> Active if no database connection string is provided
 */

import fs from "fs";
import path from "path";
import os from "os";

export type DatabaseProvider = "postgres" | "mongodb" | "local";

const PERSISTENCE_FILE = path.join(os.tmpdir(), "snapbite_server_store.json");

// Lazy database clients
let pgPool: any = null;
let mongoClient: any = null;
let mongoDb: any = null;
let isDbInitialized = false;

export class UniversalDB {
  /**
   * Detects which database provider is configured based on environment variables
   */
  static getProvider(): DatabaseProvider {
    const pgUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;

    if (pgUrl && (pgUrl.startsWith("postgres://") || pgUrl.startsWith("postgresql://"))) {
      return "postgres";
    }
    if (mongoUri && (mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://"))) {
      return "mongodb";
    }
    return "local";
  }

  /**
   * Initializes PostgreSQL pool and creates tables if needed
   */
  private static async getPostgresPool() {
    if (pgPool) return pgPool;

    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) return null;

    try {
      const { Pool } = await import("pg");
      pgPool = new Pool({
        connectionString,
        ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Ensure storage table exists
      if (!isDbInitialized) {
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS snapbite_store (
            key VARCHAR(64) PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
        isDbInitialized = true;
      }

      return pgPool;
    } catch (err: any) {
      console.warn("[UniversalDB PostgreSQL Connection Warning]:", err.message);
      return null;
    }
  }

  /**
   * Initializes MongoDB client and collection if needed
   */
  private static async getMongoDb() {
    if (mongoDb) return mongoDb;

    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!uri) return null;

    try {
      const { MongoClient } = await import("mongodb");
      mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      await mongoClient.connect();
      mongoDb = mongoClient.db("snapbite");
      return mongoDb;
    } catch (err: any) {
      console.warn("[UniversalDB MongoDB Connection Warning]:", err.message);
      return null;
    }
  }

  /**
   * Loads state from the active database provider
   */
  static async loadState(): Promise<any | null> {
    const provider = this.getProvider();

    // 1. PostgreSQL
    if (provider === "postgres") {
      try {
        const pool = await this.getPostgresPool();
        if (pool) {
          const res = await pool.query("SELECT data FROM snapbite_store WHERE key = 'master_state' LIMIT 1;");
          if (res.rows && res.rows.length > 0 && res.rows[0].data) {
            console.log("⚡ [UniversalDB] Loaded authoritative state from PostgreSQL.");
            return res.rows[0].data;
          }
        }
      } catch (err: any) {
        console.warn("[UniversalDB PostgreSQL Read Error, falling back to local]:", err.message);
      }
    }

    // 2. MongoDB
    if (provider === "mongodb") {
      try {
        const db = await this.getMongoDb();
        if (db) {
          const col = db.collection("store");
          const doc = await col.findOne({ key: "master_state" });
          if (doc && doc.data) {
            console.log("⚡ [UniversalDB] Loaded authoritative state from MongoDB.");
            return doc.data;
          }
        }
      } catch (err: any) {
        console.warn("[UniversalDB MongoDB Read Error, falling back to local]:", err.message);
      }
    }

    // 3. Local file fallback
    try {
      if (fs.existsSync(PERSISTENCE_FILE)) {
        const content = fs.readFileSync(PERSISTENCE_FILE, "utf-8");
        if (content) {
          return JSON.parse(content);
        }
      }
    } catch (e) {
      // Ignore local read errors
    }

    return null;
  }

  /**
   * Persists state to the active database provider asynchronously
   */
  static async saveState(data: any): Promise<void> {
    const provider = this.getProvider();

    // 1. Always write to local tmp file as fast backup
    try {
      fs.writeFileSync(PERSISTENCE_FILE, JSON.stringify(data), "utf-8");
    } catch (e) {}

    // 2. PostgreSQL
    if (provider === "postgres") {
      try {
        const pool = await this.getPostgresPool();
        if (pool) {
          await pool.query(
            `INSERT INTO snapbite_store (key, data, updated_at)
             VALUES ('master_state', $1, NOW())
             ON CONFLICT (key) DO UPDATE
             SET data = EXCLUDED.data, updated_at = NOW();`,
            [JSON.stringify(data)]
          );
        }
      } catch (err: any) {
        console.warn("[UniversalDB PostgreSQL Write Error]:", err.message);
      }
    }

    // 3. MongoDB
    if (provider === "mongodb") {
      try {
        const db = await this.getMongoDb();
        if (db) {
          const col = db.collection("store");
          await col.updateOne(
            { key: "master_state" },
            { $set: { key: "master_state", data, updated_at: new Date() } },
            { upsert: true }
          );
        }
      } catch (err: any) {
        console.warn("[UniversalDB MongoDB Write Error]:", err.message);
      }
    }
  }

  /**
   * Diagnostics: Test database connection and return status info
   */
  static async getHealth(): Promise<{
    provider: DatabaseProvider;
    connected: boolean;
    details: string;
  }> {
    const provider = this.getProvider();

    if (provider === "postgres") {
      try {
        const pool = await this.getPostgresPool();
        if (pool) {
          const res = await pool.query("SELECT NOW();");
          return {
            provider: "postgres",
            connected: Boolean(res.rows[0]),
            details: "Connected to PostgreSQL database.",
          };
        }
      } catch (err: any) {
        return {
          provider: "postgres",
          connected: false,
          details: `PostgreSQL connection error: ${err.message}`,
        };
      }
    }

    if (provider === "mongodb") {
      try {
        const db = await this.getMongoDb();
        if (db) {
          await db.command({ ping: 1 });
          return {
            provider: "mongodb",
            connected: true,
            details: "Connected to MongoDB database.",
          };
        }
      } catch (err: any) {
        return {
          provider: "mongodb",
          connected: false,
          details: `MongoDB connection error: ${err.message}`,
        };
      }
    }

    return {
      provider: "local",
      connected: true,
      details: "Using high-speed in-memory store with local disk cache.",
    };
  }
}
