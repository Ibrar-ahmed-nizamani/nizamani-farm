"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { formatDatePattern } from "@/lib/utils";

interface Expense {
  _id: string;
  farmerId: string;
  type: "expense" | "income";
  expenseType?: string;
  amount: number;
  description: string;
  date: string | Date;
  sharePercentage?: number | null;
}

interface PrintFarmerSummaryProps {
  farmer: {
    name: string;
    fieldName: string;
    allocatedArea: number;
    shareType: string;
  };
  expenses: Expense[];
  summary: {
    totalFarmerExpenses: number;
    totalOwnerExpenses: number;
    totalIncome: number;
    farmerIncome: number;
    ownerIncome: number;
    farmerSharePercentage: number;
  };
}

export default function PrintFarmerSummary({
  farmer,
  expenses,
  summary,
}: PrintFarmerSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total expenses and income
  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + (curr.type === "expense" ? curr.amount : 0),
    0
  );

  const totalIncome = expenses.reduce(
    (acc, curr) => acc + (curr.type === "income" ? curr.amount : 0),
    0
  );

  // Calculate net balances
  const farmerNetBalance = summary.farmerIncome - summary.totalFarmerExpenses;
  const ownerNetBalance = summary.ownerIncome - summary.totalOwnerExpenses;

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      // Sort expenses by date
      const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const printContent = `
        <html>
          <head>
            <title>Farmer Field Report</title>
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
              .info-box {
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                margin-bottom: 20px;
              }
              .info-box h2 {
                font-size: 14px;
                margin-top: 0;
                margin-bottom: 8px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
              }
              .info-box p {
                margin: 5px 0;
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
              .split-summary {
                margin-bottom: 20px;
                border: 1px solid #ddd;
              }
              .split-header {
                background-color: #f5f5f5;
                padding: 8px 10px;
                font-weight: bold;
                border-bottom: 1px solid #ddd;
              }
              .split-content {
                padding: 10px;
                display: flex;
              }
              .split-column {
                flex: 1;
                padding: 0 10px;
              }
              .split-column h3 {
                font-size: 12px;
                margin-top: 0;
                margin-bottom: 10px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
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
              .net-balance {
                margin-top: 20px;
                border: 2px solid #ddd;
                padding: 10px;
              }
              .net-balance h2 {
                font-size: 14px;
                margin-top: 0;
                margin-bottom: 10px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
              }
              .net-balance-table {
                width: 100%;
              }
              @media print {
                button { display: none; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Farmer Field Report</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="info-box">
              <h2>Farmer & Field Information</h2>
              <p><strong>Farmer Name:</strong> ${farmer.name}</p>
              <p><strong>Field Name:</strong> ${farmer.fieldName}</p>
              <p><strong>Allocated Area:</strong> ${
                farmer.allocatedArea
              } acres</p>
              <p><strong>Share Type:</strong> ${farmer.shareType} (${
        summary.farmerSharePercentage
      }%)</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>Total Expenses:</strong>
                <p class="expense">Rs ${totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Total Income:</strong>
                <p class="income">Rs ${totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Net Balance:</strong>
                <p class="${
                  totalIncome - totalExpenses >= 0 ? "income" : "expense"
                }">
                  Rs ${Math.abs(
                    totalIncome - totalExpenses
                  ).toLocaleString()} ${
        totalIncome - totalExpenses >= 0 ? "Cr" : "Dr"
      }
                </p>
              </div>
            </div>

            <div class="split-summary">
              <div class="split-header">Expenses & Income Split</div>
              <div class="split-content">
                <div class="split-column">
                  <h3>Expenses Split</h3>
                  <p><strong>Owner's Expenses:</strong> <span class="expense">Rs ${summary.totalOwnerExpenses.toLocaleString()}</span></p>
                  <p><strong>Farmer's Expenses:</strong> <span class="expense">Rs ${summary.totalFarmerExpenses.toLocaleString()}</span></p>
                </div>
                <div class="split-column">
                  <h3>Income Split (${
                    summary.farmerSharePercentage
                  }% Farmer)</h3>
                  <p><strong>Owner's Income:</strong> <span class="income">Rs ${summary.ownerIncome.toLocaleString()}</span></p>
                  <p><strong>Farmer's Income:</strong> <span class="income">Rs ${summary.farmerIncome.toLocaleString()}</span></p>
                </div>
              </div>
            </div>

            <div class="net-balance">
              <h2>Net Balance</h2>
              <table class="net-balance-table">
                <tr>
                  <td><strong>Owner's Net Balance:</strong></td>
                  <td class="amount ${
                    ownerNetBalance >= 0 ? "income" : "expense"
                  }">
                    <strong>Rs ${Math.abs(ownerNetBalance).toLocaleString()} ${
        ownerNetBalance >= 0 ? "Cr" : "Dr"
      }</strong>
                  </td>
                </tr>
                <tr>
                  <td><strong>Farmer's Net Balance:</strong></td>
                  <td class="amount ${
                    farmerNetBalance >= 0 ? "income" : "expense"
                  }">
                    <strong>Rs ${Math.abs(farmerNetBalance).toLocaleString()} ${
        farmerNetBalance >= 0 ? "Cr" : "Dr"
      }</strong>
                  </td>
                </tr>
              </table>
            </div>

            <h2>Field Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th class="amount">Expense (Rs)</th>
                  <th class="amount">Income (Rs)</th>
                  <th class="amount">Farmer Share</th>
                </tr>
              </thead>
              <tbody>
                ${sortedExpenses
                  .map(
                    (expense) => `
                  <tr>
                    <td>${
                      typeof expense.date === "string"
                        ? formatDatePattern(expense.date)
                        : formatDatePattern(expense.date.toISOString())
                    }</td>
                    <td>${
                      expense.type === "expense"
                        ? expense.expenseType || "Expense"
                        : "Income"
                    }${
                      expense.type === "expense" &&
                      expense.sharePercentage !== null &&
                      expense.sharePercentage !== undefined &&
                      expense.sharePercentage > 0
                        ? ` (${expense.sharePercentage}% farmer)`
                        : expense.type === "income"
                        ? ` (${summary.farmerSharePercentage}% farmer)`
                        : ""
                    }</td>
                    <td>${expense.description}</td>
                    <td class="amount ${
                      expense.type === "expense" ? "expense" : ""
                    }">
                      ${
                        expense.type === "expense"
                          ? expense.amount.toLocaleString()
                          : "-"
                      }
                    </td>
                    <td class="amount ${
                      expense.type === "income" ? "income" : ""
                    }">
                      ${
                        expense.type === "income"
                          ? expense.amount.toLocaleString()
                          : "-"
                      }
                    </td>
                    <td class="amount">
                      ${
                        expense.type === "expense" &&
                        expense.sharePercentage !== null &&
                        expense.sharePercentage !== undefined
                          ? `${expense.sharePercentage}%`
                          : expense.type === "income"
                          ? `${summary.farmerSharePercentage}%`
                          : "-"
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
                  <strong>Total Expenses:</strong>
                </td>
                <td class="amount expense" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${totalExpenses.toLocaleString()}
                </td>
              </tr>
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
                  <strong>Balance:</strong>
                </td>
                <td class="amount ${
                  totalIncome - totalExpenses >= 0 ? "income" : "expense"
                }" 
                    style="width: 150px; border: 2px solid #ddd;">
                  <strong>Rs ${Math.abs(
                    totalIncome - totalExpenses
                  ).toLocaleString()} ${
        totalIncome - totalExpenses >= 0 ? "Cr" : "Dr"
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
      console.error("Failed to generate farmer field report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} variant="outline" disabled={isLoading}>
      <Printer className="mr-2 h-4 w-4" />
      {isLoading ? "Preparing..." : "Print Field Report"}
    </Button>
  );
}
