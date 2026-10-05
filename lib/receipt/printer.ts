import { Order, Restaurant } from "@/types/database";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function printThermalReceipt(order: Order, restaurant: Restaurant): void {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank", "width=420,height=650");
  if (!printWindow) {
    alert("Please allow pop-ups to print order receipts.");
    return;
  }

  const itemsHtml = (order.items || [])
    .map((item) => {
      const addonsText =
        item.addons && item.addons.length > 0
          ? `<div style="font-size: 11px; color: #555; padding-left: 14px;">${item.addons
              .map((a) => `+ ${a.addon_name_snapshot} (${formatCurrency(a.price, restaurant.currency)})`)
              .join("<br/>")}</div>`
          : "";
      const noteText = item.customer_note
        ? `<div style="font-size: 11px; color: #777; font-style: italic; padding-left: 14px;">“${item.customer_note}”</div>`
        : "";

      return `
        <tr>
          <td style="padding: 4px 0; vertical-align: top; width: 28px; font-weight: bold;">${item.quantity}x</td>
          <td style="padding: 4px 0; vertical-align: top;">
            <div style="font-weight: 600;">${item.item_name_snapshot}</div>
            ${addonsText}
            ${noteText}
          </td>
          <td style="padding: 4px 0; vertical-align: top; text-align: right; font-weight: bold;">
            ${formatCurrency(item.subtotal, restaurant.currency)}
          </td>
        </tr>
      `;
    })
    .join("");

  const logoHtml = restaurant.logo_url
    ? `<img src="${restaurant.logo_url}" alt="" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; margin: 0 auto 6px auto; display: block;" />`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt ${order.order_number}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 4mm;
          }
          body {
            font-family: 'Courier New', Courier, monospace, -apple-system, sans-serif;
            margin: 0;
            padding: 8px;
            color: #000;
            background: #fff;
            width: 100%;
            max-width: 320px;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .title {
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0 0 2px 0;
            letter-spacing: 0.5px;
          }
          .subtext {
            font-size: 11px;
            color: #333;
            margin: 2px 0;
          }
          .meta-table {
            width: 100%;
            font-size: 11px;
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 6px;
          }
          .meta-table td {
            padding: 1px 0;
          }
          .items-table {
            width: 100%;
            font-size: 12px;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .totals-table {
            width: 100%;
            font-size: 12px;
            border-top: 1px dashed #000;
            padding-top: 6px;
            margin-top: 6px;
          }
          .totals-table td {
            padding: 2px 0;
          }
          .grand-total {
            font-size: 16px;
            font-weight: 900;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 6px 0 !important;
          }
          .footer {
            text-align: center;
            margin-top: 12px;
            font-size: 10px;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
          @media print {
            body {
              max-width: 100%;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoHtml}
          <div class="title">${restaurant.name}</div>
          ${restaurant.address ? `<div class="subtext">${restaurant.address}</div>` : ""}
          ${restaurant.phone ? `<div class="subtext">Tel: ${restaurant.phone}</div>` : ""}
        </div>

        <table class="meta-table">
          <tr>
            <td><strong>ORDER:</strong> ${order.order_number}</td>
            <td style="text-align: right;"><strong>TABLE:</strong> ${order.table?.table_number || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>DATE:</strong> ${formatDateTime(order.created_at)}</td>
            <td style="text-align: right;"><strong>PAYMENT:</strong> ${order.payment_status.toUpperCase()}</td>
          </tr>
          ${
            order.customer_name
              ? `<tr><td colspan="2"><strong>GUEST:</strong> ${order.customer_name}</td></tr>`
              : ""
          }
          ${
            order.customer_note
              ? `<tr><td colspan="2" style="font-style: italic; color: #444;"><strong>NOTE:</strong> ${order.customer_note}</td></tr>`
              : ""
          }
        </table>

        <table class="items-table">
          <thead>
            <tr style="border-bottom: 1px solid #000; font-size: 11px;">
              <th style="text-align: left; padding-bottom: 4px;">QTY</th>
              <th style="text-align: left; padding-bottom: 4px;">ITEM</th>
              <th style="text-align: right; padding-bottom: 4px;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">${formatCurrency(order.subtotal, restaurant.currency)}</td>
          </tr>
          <tr>
            <td>Tax (${restaurant.tax_percentage}%):</td>
            <td style="text-align: right;">${formatCurrency(order.tax, restaurant.currency)}</td>
          </tr>
          ${
            restaurant.service_charge_percentage > 0
              ? `<tr>
                  <td>Service Charge (${restaurant.service_charge_percentage}%):</td>
                  <td style="text-align: right;">${formatCurrency(order.service_charge, restaurant.currency)}</td>
                </tr>`
              : ""
          }
          <tr>
            <td class="grand-total">TOTAL AMOUNT:</td>
            <td class="grand-total" style="text-align: right;">${formatCurrency(order.total, restaurant.currency)}</td>
          </tr>
          <tr>
            <td style="padding-top: 6px; font-size: 11px;">Payment Method:</td>
            <td style="padding-top: 6px; text-align: right; font-weight: bold; font-size: 11px; text-transform: uppercase;">
              ${order.payment_method} (${order.payment_status})
            </td>
          </tr>
        </table>

        <div class="footer">
          <div>*** THANK YOU FOR DINING WITH US ***</div>
          <div style="margin-top: 4px; color: #666;">Powered by SnapBite Digital Ordering</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
