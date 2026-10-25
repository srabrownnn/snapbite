'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Restaurant, AuthSession } from "@/types/database";
import { SnapBiteStore } from "@/lib/store/demo-store";

interface SignupParams {
  fullName: string;
  email: string;
  password?: string;
  restaurantName: string;
  phone?: string;
  slug?: string;
}

interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (params: SignupParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRestaurant: (restaurantId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  restaurant: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  switchRestaurant: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncSessionToStore = (session: AuthSession) => {
    setUser(session.user);
    setRestaurant(session.restaurant);
    SnapBiteStore.setAuthSession(session);
    SnapBiteStore.setCurrentRestaurantId(session.restaurant.id);

    // Save restaurant to store array if not exists
    const allRests = SnapBiteStore.getAllRestaurants();
    if (!allRests.some((r) => r.id === session.restaurant.id)) {
      SnapBiteStore.updateRestaurant(session.restaurant);
    }
  };

  useEffect(() => {
    // 1. Check local session first for fast hydration
    const cachedSession = SnapBiteStore.getAuthSession();
    if (cachedSession && cachedSession.user && cachedSession.restaurant) {
      setUser(cachedSession.user);
      setRestaurant(cachedSession.restaurant);
    }

    // 2. Background verify with server
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user && data.restaurant) {
          syncSessionToStore({
            user: data.user,
            restaurant: data.restaurant,
            token: "active",
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user && data.restaurant) {
        const session: AuthSession = {
          user: data.user,
          restaurant: data.restaurant,
          token: data.token,
        };
        syncSessionToStore(session);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || "Invalid email or password." };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: "Network error during login. Please try again." };
    }
  };

  const signup = async (params: SignupParams): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user && data.restaurant) {
        const session: AuthSession = {
          user: data.user,
          restaurant: data.restaurant,
          token: data.token,
        };
        syncSessionToStore(session);

        // Fetch fresh starter tables and categories from server to local cache
        SnapBiteStore.syncTablesWithServer(data.restaurant.id).catch(() => {});
        SnapBiteStore.syncWithCloudServer(data.restaurant.id).catch(() => {});

        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || "Registration failed." };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: "Network error during signup. Please try again." };
    }
  };

  const logout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setRestaurant(null);
    SnapBiteStore.clearAuthSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const switchRestaurant = (restaurantId: string) => {
    const match = SnapBiteStore.getRestaurant(restaurantId);
    if (match) {
      setRestaurant(match);
      SnapBiteStore.setCurrentRestaurantId(match.id);
      if (user) {
        const updatedUser = { ...user, restaurant_id: match.id };
        setUser(updatedUser);
        SnapBiteStore.setAuthSession({
          user: updatedUser,
          restaurant: match,
          token: "active",
        });
      }
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        isLoading,
        isAuthenticated: Boolean(user && restaurant),
        login,
        signup,
        logout,
        switchRestaurant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
