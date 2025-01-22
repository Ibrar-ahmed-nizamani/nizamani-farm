"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { formatDatePattern, monthNumberToName } from "@/lib/utils";
import { Transaction } from "@/lib/type-definitions";

interface PrintMilkSummaryProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  selectedYear?: string;
  selectedMonth?: string;
}

export default function PrintMilkSummary({
  transactions,
  totalIncome,
  totalExpense,
  totalBalance,
  selectedYear,
  selectedMonth,
}: PrintMilkSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      const printContent = `
        <html>
          <head>
            <title>Milk Summary Report</title>
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
              .income { color: green; }
              .expense { color: red; }
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
              <h1>Milk Summary Report</h1>
              <p>Period: ${selectedYear ? selectedYear : "All Years"}${
        selectedMonth ? ` - ${monthNumberToName(Number(selectedMonth))}` : ""
      }</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>Total Income:</strong>
                <p class="income">Rs ${totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Total Expenses:</strong>
                <p class="expense">Rs ${totalExpense.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Net Balance:</strong>
                <p class="${totalBalance >= 0 ? "income" : "expense"}">
                  Rs ${Math.abs(totalBalance)} ${
        totalBalance >= 0 ? "Cr" : "Dr"
      }
                </p>
              </div>
            </div>

            <table style="border-bottom: 2px solid #ddd;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Expense Detail</th>
                  <th>Income Details</th>
                  <th class="amount">Income</th>
                  <th class="amount">Expense</th>
                  <th class="amount">Balance</th>
                </tr>
              </thead>
              <tbody>
                ${transactions
                  .map(
                    (transaction) => `
                  <tr>
                    <td>${formatDatePattern(
                      transaction.date.toISOString()
                    )}</td>
                    <td>${
                      transaction.type === "income"
                        ? transaction.description
                        : "-"
                    }</td>
                    <td>${
                      transaction.type === "expense"
                        ? transaction.description
                        : "-"
                    }</td>
                    <td>${transaction.details}</td>
                    <td class="amount">${
                      transaction.amount > 0
                        ? `Rs ${transaction.amount.toFixed(0)}`
                        : "-"
                    }</td>
                    <td class="amount">${
                      transaction.amount < 0
                        ? `Rs ${Math.abs(transaction.amount).toFixed(0)}`
                        : "-"
                    }</td>
                    <td class="amount ${
                      transaction.balance && transaction.balance >= 0
                        ? "income"
                        : "expense"
                    }">
                      Rs ${
                        transaction.balance &&
                        Math.abs(transaction.balance).toFixed(0)
                      } ${
                      transaction.balance && transaction.balance >= 0
                        ? "Cr"
                        : "Dr"
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
                  <strong>Total Income:</strong>
                </td>
                <td class="amount income" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${totalIncome.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Expenses:</strong>
                </td>
                <td class="amount expense" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${totalExpense.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Net Balance:</strong>
                </td>
                <td class="amount ${totalBalance >= 0 ? "income" : "expense"}" 
                    style="width: 150px; border: 2px solid #ddd;">
                  <strong>Rs ${Math.abs(totalBalance)} ${
        totalBalance >= 0 ? "Cr" : "Dr"
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
      console.error("Failed to generate milk summary report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} variant="outline" disabled={isLoading}>
      <Printer className="mr-2 h-4 w-4" />
      {isLoading ? "Preparing..." : "Print Summary Report"}
    </Button>
  );
}
