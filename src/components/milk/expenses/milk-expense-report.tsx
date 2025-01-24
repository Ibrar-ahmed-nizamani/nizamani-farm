"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { formatDatePattern, monthNumberToName } from "@/lib/utils";

interface MilkExpense {
  _id: string;
  amount: number;
  date: string | Date;
  type: {
    name: string;
  };
}

interface PrintMilkExpensesReportProps {
  expenses: MilkExpense[];
  year?: string;
  month?: string;
  summaryData: {
    totalExpenses: number;
    expensesByType: { name: string; amount: number }[];
  };
}

export default function PrintMilkExpensesReport({
  expenses,
  year,
  month,
  summaryData,
}: PrintMilkExpensesReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      const printContent = `
        <html>
          <head>
            <title>Milk Expenses Report</title>
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
              .summary {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                margin-bottom: 20px;
                gap: 15px;
              }
              .summary-item {
                flex: 1;
                min-width: 200px;
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
              .type-summary {
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
              <h1>Milk Expenses Report</h1>
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
                <strong>Total Expenses:</strong>
                <p>Rs ${summaryData.totalExpenses.toLocaleString()}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Expense Type</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${expenses
                  .map(
                    (expense) => `
                  <tr>
                    <td>${formatDatePattern(expense.date)}</td>
                    <td>${expense.type.name}</td>
                    <td class="amount">Rs ${expense.amount.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="type-summary">
              <h3>Expenses by Type</h3>
              <table>
                <thead>
                  <tr>
                    <th>Expense Type</th>
                    <th class="amount">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${summaryData.expensesByType
                    .map(
                      (type) => `
                    <tr>
                      <td>${type.name}</td>
                      <td class="amount">Rs ${type.amount.toLocaleString()}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
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
      <Printer className="h-4 w-4 mr-2" />
      {isLoading ? "Preparing..." : "Print Report"}
    </Button>
  );
}
