// src/app/lib/downloadHelpers.ts
/**
 * Utility functions for client-side downloadable Reports, Fee Receipts, and Marksheets.
 */

export interface ReceiptExportData {
  receiptNo: string;
  transactionId: string;
  date: string;
  studentName: string;
  studentId: number | string;
  rollNo?: string;
  course: string;
  batch?: string;
  amount: number;
  paymentMethod: string;
  paymentMode: string;
  remarks?: string;
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
}

export const formatCurrency = formatINR;

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Launches a clean printable pop-up receipt window
 */
export function printReceiptWindow(receipt: ReceiptExportData) {
  const printWindow = window.open("", "_blank", "width=850,height=750");
  if (!printWindow) return;

  const formattedDate = new Date(receipt.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  printWindow.document.write(`
    <html>
      <head>
        <title>Maa Gauri ITI - Receipt #${receipt.receiptNo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 2.5rem; margin: 0; background-color: #f8fafc; }
          .receipt-card { max-width: 760px; margin: auto; border: 1px solid #e2e8f0; padding: 3rem; border-radius: 16px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
          .header-row { display: flex; justify-content: space-between; align-items: start; border-bottom: 2.5px solid #4285cd; padding-bottom: 1.5rem; margin-bottom: 2rem; }
          .header-left h1 { color: #06090c; margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.025em; }
          .header-left p { margin: 0.35rem 0 0; color: #64748b; font-size: 0.95rem; }
          .badge-success { display: inline-block; padding: 0.5rem 1.15rem; background: #dcfce7; color: #166534; font-weight: 700; border-radius: 9999px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.75rem; margin-bottom: 2.5rem; }
          .info-item h4 { margin: 0 0 0.35rem 0; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
          .info-item p { margin: 0; font-size: 1.1rem; font-weight: 600; color: #0f172a; }
          .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 2.5rem; }
          .receipt-table th { padding: 1rem 1.25rem; text-align: left; border-bottom: 2px solid #e2e8f0; background-color: #f8fafc; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 0.8rem; }
          .receipt-table td { padding: 1.25rem; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 1.05rem; line-height: 1.5; }
          .total-section { display: flex; justify-content: flex-end; align-items: center; gap: 2rem; padding-top: 1.5rem; border-top: 2px solid #e2e8f0; }
          .total-label { font-size: 1.15rem; color: #64748b; font-weight: 600; }
          .total-val { margin: 0; color: #4285cd; font-size: 1.85rem; font-weight: 800; }
          .receipt-footer { text-align: center; margin-top: 3.5rem; font-size: 0.88rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
          .print-action { background: #4285cd; color: #ffffff; padding: 0.65rem 1.25rem; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; transition: background 0.2s; }
          .print-action:hover { background: #2f8ad4; }
          @media print {
            .print-action { display: none; }
            body { padding: 0; background-color: #ffffff; }
            .receipt-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <button class="print-action" onclick="window.print()">Print / Export PDF</button>
          
          <div class="header-row">
            <div class="header-left">
              <h1>MAA GAURI PRIVATE ITI</h1>
              <p>Affiliated to NCVT (Govt. of India) • Code: GR090011</p>
              <p>Campus: Main Road, Paliganj, Patna, Bihar - 801110</p>
            </div>
            <div>
              <span class="badge-success">Success</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <h4>Student Name</h4>
              <p>${receipt.studentName}</p>
            </div>
            <div class="info-item">
              <h4>Receipt Number</h4>
              <p>${receipt.receiptNo}</p>
            </div>
            <div class="info-item">
              <h4>Course / Trade</h4>
              <p>${receipt.course}</p>
            </div>
            <div class="info-item">
              <h4>Transaction Date</h4>
              <p>${formattedDate}</p>
            </div>
            <div class="info-item">
              <h4>Transaction ID</h4>
              <p>${receipt.transactionId}</p>
            </div>
            <div class="info-item">
              <h4>Payment Mode</h4>
              <p>${receipt.paymentMode} (${receipt.paymentMethod})</p>
            </div>
          </div>

          <table class="receipt-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Academic Tuition & Fee installment payment
                  <div style="font-size: 0.88rem; color: #64748b; margin-top: 0.25rem;">
                    Remarks: ${receipt.remarks || 'Receipt Recorded in ITI ERP'}
                  </div>
                </td>
                <td style="text-align: right; font-weight: 700; color: #0f172a;">${formatINR(receipt.amount)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <span class="total-label">Total Amount Paid:</span>
            <h3 class="total-val">${formatINR(receipt.amount)}</h3>
          </div>

          <div class="receipt-footer">
            <p>This is an officially verified computer-generated record of payment. No physical signature is required.</p>
            <p>For any queries, contact info@mgiti.edu.in</p>
            <p style="margin-top: 0.5rem; font-weight: 600;">&copy; ${new Date().getFullYear()} Maa Gauri Private ITI. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Triggers a file download in the user's browser
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Download standard CSV spreadsheet
 */
export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = "\uFEFF" + [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerBlobDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

/**
 * Download a self-contained, beautifully styled HTML Receipt that prints cleanly.
 */
export function downloadReceiptHtml(receipt: ReceiptExportData) {
  const formattedDate = new Date(receipt.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fee Receipt - ${receipt.receiptNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .receipt-container {
      background: #ffffff;
      max-width: 780px;
      width: 100%;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .btn {
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      background: #4285cd;
      color: #ffffff;
    }
    .btn:hover { background: #2f8ad4; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 1.5rem;
      margin-bottom: 1.75rem;
    }
    .institute-title { font-size: 1.6rem; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }
    .institute-sub { font-size: 0.8rem; color: #64748b; font-weight: 600; margin-top: 0.2rem; }
    .institute-address { font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem; }
    .receipt-badge {
      text-align: right;
      background: #f1f5f9;
      padding: 0.75rem 1rem;
      border-radius: 12px;
    }
    .receipt-badge span { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #4285cd; }
    .receipt-badge h3 { font-size: 0.95rem; font-weight: 800; font-family: monospace; color: #0f172a; }
    .receipt-badge p { font-size: 0.75rem; color: #64748b; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 1.75rem; }
    .grid-item span { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 0.2rem; }
    .grid-item b { font-size: 0.95rem; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.75rem; }
    th { background: #f8fafc; text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1.5px solid #e2e8f0; }
    td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
    .amount-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 2.5rem;
    }
    .amount-box .status { font-weight: 800; font-size: 0.85rem; color: #15803d; }
    .amount-box .total { font-size: 1.5rem; font-weight: 900; color: #4285cd; }
    .footer-signs { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 3rem; text-align: center; }
    .sign-line { width: 150px; border-bottom: 1.5px dashed #cbd5e1; margin-bottom: 0.4rem; }
    .sign-text { font-size: 0.75rem; color: #64748b; font-weight: 600; }
    .seal-box {
      border: 2px dashed #4285cd;
      color: #4285cd;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 900;
      text-transform: uppercase;
      transform: rotate(-3deg);
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-container { box-shadow: none; border: none; padding: 0; }
      .toolbar { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="toolbar">
      <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
      <div>
        <h1 class="institute-title">MAA GAURI PRIVATE ITI</h1>
        <p class="institute-sub">NCVT Affiliated • DGT Approved • Code: 01/01/01/19322/08</p>
        <p class="institute-address">Campus: NH-98, Near Maa Gauri Fuel, Arwal Road, Paliganj, Patna, Bihar 801110</p>
      </div>
      <div class="receipt-badge">
        <span>Official Fee Receipt</span>
        <h3>${receipt.receiptNo}</h3>
        <p>${formattedDate}</p>
      </div>
    </div>

    <div class="grid">
      <div class="grid-item">
        <span>Student Name</span>
        <b>${receipt.studentName}</b>
      </div>
      <div class="grid-item">
        <span>Roll / Student ID</span>
        <b>${receipt.rollNo || `#${receipt.studentId}`}</b>
      </div>
      <div class="grid-item">
        <span>Trade / Course</span>
        <b style="color: #4285cd;">${receipt.course}</b>
      </div>
      <div class="grid-item">
        <span>Academic Session</span>
        <b>${receipt.batch || "2024-2026"}</b>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Particulars / Description</th>
          <th>Transaction Reference</th>
          <th>Payment Method</th>
          <th style="text-align: right;">Amount Paid</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Tuition & Academic Training Installment</strong>
            <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.2rem;">${receipt.remarks || "Semester fee installment"}</p>
          </td>
          <td style="font-family: monospace;">${receipt.transactionId}</td>
          <td>${receipt.paymentMode} (${receipt.paymentMethod})</td>
          <td style="text-align: right; font-weight: 800;">${formatINR(receipt.amount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="amount-box">
      <div>
        <div class="status">✓ Payment Verified & Completed</div>
        <p style="font-size: 0.75rem; color: #64748b;">Electronic Transaction Recorded in ERP Ledger</p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 0.75rem; color: #64748b; display: block; font-weight: 700;">Total Amount Paid:</span>
        <div class="total">${formatINR(receipt.amount)}</div>
      </div>
    </div>

    <div class="footer-signs">
      <div>
        <div class="sign-line"></div>
        <div class="sign-text">Student / Depositor Signature</div>
      </div>
      <div class="seal-box">
        Official Seal Verified
      </div>
      <div>
        <div class="sign-line"></div>
        <div class="sign-text">Authorized Accounts Officer</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  triggerBlobDownload(blob, `Receipt_${receipt.receiptNo}.html`);
}

/**
 * Download a styled, comprehensive HTML Report document with table and summary
 */
export function downloadReportHtml(title: string, headers: string[], rows: string[][], summaryNotes?: string) {
  const generatedOn = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const tableHeaders = headers.map((h) => `<th>${h}</th>`).join("");
  const tableRows = rows
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td>${c.replace(/^"(.*)"$/, "$1")}</td>`).join("")}</tr>`
    )
    .join("\n");

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Maa Gauri ITI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 2.5rem;
    }
    .report-card {
      background: #ffffff;
      max-width: 1100px;
      margin: 0 auto;
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px -5px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      border: none;
      background: #4285cd;
      color: #ffffff;
    }
    .btn:hover { background: #2f8ad4; }
    .header {
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title { font-size: 1.75rem; font-weight: 900; color: #0f172a; }
    .sub { font-size: 0.85rem; color: #64748b; font-weight: 600; margin-top: 0.25rem; }
    .meta { text-align: right; font-size: 0.8rem; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.85rem; }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.75rem;
      padding: 0.85rem 1rem;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }
    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    tr:nth-child(even) { background-color: #fafbfc; }
    .summary-box {
      margin-top: 2rem;
      padding: 1.25rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      font-size: 0.85rem;
      color: #475569;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .report-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .toolbar { display: none; }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="toolbar">
      <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
      <div>
        <h1 class="title">${title}</h1>
        <p class="sub">Maa Gauri Private ITI • Institutional Management ERP</p>
      </div>
      <div class="meta">
        <p><strong>Generated:</strong> ${generatedOn}</p>
        <p><strong>Total Records:</strong> ${rows.length}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>${tableHeaders}</tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    ${summaryNotes ? `<div class="summary-box"><strong>Audit Note:</strong> ${summaryNotes}</div>` : ""}

    <div class="footer">
      This is a system-generated official report exported from Maa Gauri ITI ERP.
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  triggerBlobDownload(blob, `${title.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.html`);
}

/**
 * Download a standalone official Marksheet HTML document
 */
export function downloadMarksheetHtml(marksheet: any) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Marksheet - ${marksheet.certificate_no}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 2.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .sheet {
      background: #ffffff;
      max-width: 800px;
      width: 100%;
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      border: 2px solid #0f172a;
    }
    .toolbar { display: flex; justify-content: flex-end; margin-bottom: 1.5rem; }
    .btn {
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      border: none;
      background: #4285cd;
      color: #ffffff;
    }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
    .header h1 { font-size: 1.5rem; font-weight: 900; }
    .header p { font-size: 0.8rem; color: #475569; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem; }
    .grid span { color: #64748b; font-weight: 600; display: block; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.85rem; }
    th { background: #f1f5f9; padding: 0.75rem; text-align: left; border-bottom: 2px solid #cbd5e1; }
    td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
    .result-box { display: flex; justify-content: space-between; background: #ecfdf5; border: 1.5px solid #a7f3d0; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; font-weight: 800; color: #065f46; }
    .footer { display: flex; justify-content: space-between; margin-top: 3rem; text-align: center; font-size: 0.8rem; }
    .line { width: 160px; border-bottom: 1px solid #94a3b8; margin-bottom: 0.3rem; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet { box-shadow: none; border: none; padding: 0; }
      .toolbar { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="toolbar">
      <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
      <p style="text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.1em; color: #64748b;">Directorate General of Training (DGT) • Govt. of India</p>
      <h1>MAA GAURI PRIVATE ITI</h1>
      <p>NCVT Affiliated Vocational Institute • Paliganj, Patna, Bihar</p>
      <div style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 1rem; background: #0f172a; color: #fff; border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">
        ${marksheet.semester} Marksheet • ${marksheet.exam_session}
      </div>
    </div>

    <div class="grid">
      <div>
        <span>Student Name:</span>
        <strong>${marksheet.student_name}</strong>
      </div>
      <div>
        <span>Roll Number:</span>
        <strong>${marksheet.roll_no}</strong>
      </div>
      <div>
        <span>Trade / Stream:</span>
        <strong>${marksheet.course}</strong>
      </div>
      <div>
        <span>Certificate No:</span>
        <strong style="font-family: monospace;">${marksheet.certificate_no}</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Subject / Practical Module</th>
          <th>Max Marks</th>
          <th>Min Pass</th>
          <th style="text-align: right;">Marks Obtained</th>
        </tr>
      </thead>
      <tbody>
        ${(marksheet.subjects || [])
          .map(
            (s: any) => `<tr>
          <td><strong>${s.name}</strong> (${s.code})</td>
          <td>${s.max}</td>
          <td>${s.min}</td>
          <td style="text-align: right; font-weight: 800;">${s.obtained}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="result-box">
      <div>Total Marks: ${marksheet.total_obtained} / ${marksheet.total_max} (${marksheet.percentage}%)</div>
      <div>Result: PASS (${marksheet.grade} Grade)</div>
    </div>

    <div class="footer">
      <div>
        <div class="line"></div>
        <div>Examination Controller</div>
      </div>
      <div>
        <div class="line"></div>
        <div>Principal / Director</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  triggerBlobDownload(blob, `Marksheet_${marksheet.certificate_no}.html`);
}
