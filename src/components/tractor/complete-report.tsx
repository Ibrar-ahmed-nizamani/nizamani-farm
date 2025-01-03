"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getAllTractorWorks } from "@/lib/actions/work";
import { getAllTractorExpenses } from "@/lib/actions/tractor-expense";

interface CompleteReportProps {
  tractorDetails: {
    tractorName: string;
    tractorModel: string;
    totalIncome: number;
    totalExpenses: number;
    revenue: number;
  };
  tractorId: string;
  year: string;
}

interface CombinedEntry {
  date: string;
  type: "income" | "expense";
  description: string;
  income?: number;
  expense?: number;
  netAmount: number;
  equipmentDetails?: string;
  customerName?: string;
  runningTotal: number;
}

export default function CompleteReport({
  tractorDetails,
  tractorId,
  year,
}: CompleteReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      // Fetch both works and expenses
      const [works, expenses] = await Promise.all([
        getAllTractorWorks(tractorId, year),
        getAllTractorExpenses(tractorId, year),
      ]);

      // Combine and sort works and expenses by date
      let runningTotal = 0;
      const combinedEntries: CombinedEntry[] = [
        ...works.map(
          (work): CombinedEntry => ({
            date: work.date,
            type: "income",
            description: "-",
            income: work.totalAmount,
            netAmount: work.totalAmount,
            equipmentDetails: work.equipments
              .map(
                (eq: { name: string; hours: number; amount: number }) =>
                  `${eq.name}: ${eq.hours}hrs - Rs${eq.amount}`
              )
              .join(", "),
            customerName: work.customerName,
            runningTotal: 0,
          })
        ),
        ...expenses.map(
          (expense): CombinedEntry => ({
            date: expense.date,
            type: "expense",
            description: expense.description,
            expense: expense.amount,
            netAmount: -expense.amount,
            runningTotal: 0,
          })
        ),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((entry) => {
          // Calculate running total
          runningTotal += (entry.income || 0) - (entry.expense || 0);
          return {
            ...entry,
            runningTotal: runningTotal, // Add running total to each entry
          };
        });

      const totalIncome = combinedEntries.reduce(
        (sum, entry) => sum + (entry.income || 0),
        0
      );
      const totalExpenses = combinedEntries.reduce(
        (sum, entry) => sum + (entry.expense || 0),
        0
      );
      const netRevenue = totalIncome - totalExpenses;

      const printContent = `
        <html>
          <head>
            <title>Complete Tractor Report</title>
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
              .equipment-details {
                font-size: 10px;
                color: #666;
              }
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
              <h1>${tractorDetails.tractorName} - ${
        tractorDetails.tractorModel
      }</h1>
              <p>Complete Report for: ${year === "all" ? "All Years" : year}</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>Total Income:</strong>
                <p class="income">Rs ${totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Total Expenses:</strong>
                <p class="expense">Rs ${totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Net Revenue:</strong>
                <p class="${netRevenue >= 0 ? "income" : "expense"}">
                  Rs ${netRevenue.toLocaleString()}
                </p>
              </div>
            </div>

            <table style="border-bottom: 2px solid #ddd;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Customer</th>
                  <th>Equipment Details</th>
                  <th class="amount">Income</th>
                  <th class="amount">Expense</th>
                  <th class="amount">Net Balance</th>
                </tr>
              </thead>
              <tbody>
                ${combinedEntries
                  .map(
                    (entry) => `
                  <tr>
                    <td>${new Date(entry.date).toLocaleDateString("en-GB")}</td>
                    <td>${entry.type}</td>
                    <td>${entry.description}</td>
                    <td>${entry.customerName || "-"}</td>
                    <td>${entry.equipmentDetails || "-"}</td>
                    <td class="amount">${
                      entry.income ? `Rs ${entry.income.toLocaleString()}` : "-"
                    }</td>
                    <td class="amount">${
                      entry.expense
                        ? `Rs ${entry.expense.toLocaleString()}`
                        : "-"
                    }</td>
                    <td class="amount ${
                      entry.runningTotal >= 0 ? "income" : "expense"
                    }">
                      Rs ${entry.runningTotal.toLocaleString()}
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
                  Rs ${totalExpenses.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Net Revenue:</strong>
                </td>
                <td class="amount ${netRevenue >= 0 ? "income" : "expense"}" 
                    style="width: 150px; border: 2px solid #ddd;">
                  <strong>Rs ${netRevenue.toLocaleString()}</strong>
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
      console.error("Failed to generate complete report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} variant="outline" disabled={isLoading}>
      <Printer className="mr-2 h-4 w-4" />
      {isLoading ? "Preparing..." : "Print Complete Report"}
    </Button>
  );
}
