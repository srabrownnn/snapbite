import QRCode from "qrcode";

export function getTableScanUrl(baseUrl: string, restaurantSlug: string, qrToken: string): string {
  // Normalize baseUrl
  const cleanBase = baseUrl.replace(/\/+$/, "");
  return `${cleanBase}/r/${restaurantSlug}/t/${qrToken}`;
}

export async function generateTableQrDataUrl(
  url: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: options?.width || 400,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
    ...options,
  });
}

export async function generateTableQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}

export function downloadQrDataUrl(dataUrl: string, fileName: string): void {
  if (typeof window === "undefined") return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSvgString(svgString: string, fileName: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printTableCard(params: {
  restaurantName: string;
  tableNumber: string;
  qrDataUrl: string;
  scanUrl: string;
  logoUrl?: string | null;
}): void {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    alert("Please allow pop-ups to print table cards.");
    return;
  }

  const logoHtml = params.logoUrl
    ? `<img src="${params.logoUrl}" alt="${params.restaurantName}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 2px solid #ea580c;" />`
    : `<div style="width: 56px; height: 56px; border-radius: 50%; background: #ea580c; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 0 auto 12px;">🍽️</div>`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Card - ${params.tableNumber}</title>
        <style>
          @page {
            size: A5 portrait;
            margin: 1cm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 90vh;
            background: #f8fafc;
          }
          .card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 24px;
            padding: 40px 32px;
            max-width: 380px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
          }
          .rest-name {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 6px 0;
            letter-spacing: -0.5px;
          }
          .tagline {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 24px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          .table-pill {
            display: inline-block;
            background: #fff7ed;
            color: #ea580c;
            border: 1.5px solid #fed7aa;
            padding: 8px 24px;
            border-radius: 9999px;
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 24px;
            box-shadow: 0 2px 4px rgba(234, 88, 12, 0.08);
          }
          .qr-wrapper {
            background: white;
            border: 2px dashed #cbd5e1;
            border-radius: 20px;
            padding: 16px;
            display: inline-block;
            margin-bottom: 20px;
          }
          .qr-img {
            display: block;
            width: 220px;
            height: 220px;
          }
          .scan-action {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 6px 0;
          }
          .scan-desc {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 16px 0;
          }
          .brand-footer {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 16px;
            border-top: 1px solid #f1f5f9;
            padding-top: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .card {
              border: 1.5px solid #334155;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="display: flex; justify-content: center;">
            ${logoHtml}
          </div>
          <h1 class="rest-name">${params.restaurantName}</h1>
          <p class="tagline">Digital Menu & Self Ordering</p>
          <div class="table-pill">${params.tableNumber}</div>
          <div class="qr-wrapper">
            <img class="qr-img" src="${params.qrDataUrl}" alt="Scan QR Code" />
          </div>
          <h2 class="scan-action">📷 Scan to Browse & Order</h2>
          <p class="scan-desc">Open your phone camera, scan the code, and order directly to this table.</p>
          <div class="brand-footer">
            <span>Powered by <strong>SnapBite</strong></span>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
