"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { formatDatePattern, monthNumberToName } from "@/lib/utils";

interface Transaction {
  date: string | Date;
  type: "debit" | "credit";
  description: string;
  amount: number;
  runningBalance: number;
}

interface PrintReportProps {
  title: string;
  personName: string;
  transactions: Transaction[];
  year?: string;
  month?: string;
  summaryData: {
    totalDebit: number;
    totalCredit: number;
    balance: number;
  };
}

export default function PrintTransactionReport({
  title,
  personName,
  transactions,
  year,
  month,
  summaryData,
}: PrintReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      const printContent = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                padding: 15px;
                max-width: 1200px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #ddd;
              }
              .header h1 {
                font-size: 18px;
                margin: 0 0 5px 0;
              }
              .header p {
                margin: 3px 0;
                color: #666;
              }
              .summary {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                gap: 15px;
              }
              .summary-item {
                flex: 1;
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 6px 8px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
                font-weight: 600;
              }
              .amount {
                text-align: right;
              }
              .credit { color: green; }
              .debit { color: red; }
              .total-table {
                width: auto;
                margin-left: auto;
                margin-top: 20px;
              }
              @media print {
                button { display: none; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${title}</h1>
              <strong>${personName}</strong>
              <p>Report for: ${
                year
                  ? month
                    ? `${monthNumberToName(Number(month))}, ${year}`
                    : year
                  : "All Time"
              }</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>Total Debit:</strong>
                <p class="debit">Rs ${summaryData.totalDebit.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Total Credit:</strong>
                <p class="credit">Rs ${summaryData.totalCredit.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Balance:</strong>
                <p class="${summaryData.balance >= 0 ? "credit" : "debit"}">
                  Rs ${Math.abs(summaryData.balance).toLocaleString()} ${
        summaryData.balance >= 0 ? "Cr" : "Dr"
      }
                </p>
              </div>
            </div>

            <table style="border-bottom: 2px solid #ddd;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Detail</th>
                  <th class="amount">Credit</th>
                  <th class="amount">Debit</th>
                  <th class="amount">Balance</th>
                </tr>
              </thead>
              <tbody>
                ${transactions
                  .map(
                    (entry) => `
                  <tr>
                    <td>${formatDatePattern(entry.date)}</td>
                    <td>${entry.description}</td>
                    <td class="amount">
                      ${
                        entry.type === "credit"
                          ? `Rs ${entry.amount.toLocaleString()}`
                          : "-"
                      }
                    </td>
                    <td class="amount">
                      ${
                        entry.type === "debit"
                          ? `Rs ${entry.amount.toLocaleString()}`
                          : "-"
                      }
                    </td>
                    <td class="amount ${
                      entry.runningBalance >= 0 ? "credit" : "debit"
                    }">
                      Rs ${Math.abs(entry.runningBalance).toLocaleString()} ${
                      entry.runningBalance >= 0 ? "Cr" : "Dr"
                    }
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <table class="total-table">
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Debit:</strong>
                </td>
                <td class="amount debit" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${summaryData.totalDebit.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Credit:</strong>
                </td>
                <td class="amount credit" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${summaryData.totalCredit.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Final Balance:</strong>
                </td>
                <td class="amount ${
                  summaryData.balance >= 0 ? "credit" : "debit"
                }" 
                    style="width: 150px; border: 2px solid #ddd;">
                  <strong>Rs ${Math.abs(
                    summaryData.balance
                  ).toLocaleString()} ${
        summaryData.balance >= 0 ? "Cr" : "Dr"
      }</strong>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} variant="outline" disabled={isLoading}>
      <Printer className="h-4 w-4" />
      {isLoading ? "Preparing..." : "Print Report"}
    </Button>
  );
}
