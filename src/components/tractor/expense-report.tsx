"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getAllTractorExpenses } from "@/lib/actions/tractor-expense";

interface ExpenseReportProps {
  tractorDetails: {
    tractorName: string;
    tractorModel: string;
  };
  tractorId: string;
  year: string;
}

export default function ExpenseReport({
  tractorDetails,
  tractorId,
  year,
}: ExpenseReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const expenses = await getAllTractorExpenses(tractorId, { year });

      const totalAmount = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const printContent = `
        <html>
          <head>
            <title>Tractor Expenses Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                padding: 15px;
                max-width: 1000px;
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
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
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
              .total-table {
                margin-top: 20px;
                width: auto;
                margin-left: auto;
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
              <p>Expenses Report for: ${year === "all" ? "All Years" : year}</p>
            </div>

            <table style="margin-bottom: 20px; border-bottom: 2px solid #ddd;">
              <thead>
                <tr>
                  <th class="serial-no">No</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${expenses
                  .map(
                    (expense, index) => `
                  <tr>
                    <td class="serial-no">${expenses.length - index}</td>
                    <td>${new Date(expense.date).toLocaleDateString(
                      "en-GB"
                    )}</td>
                    <td>${expense.description}</td>
                    <td class="amount">Rs ${expense.amount.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <!-- Separate total table -->
            <table class="total-table">
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Expenses:</strong>
                </td>
                <td class="amount" style="width: 150px; border: 2px solid #ddd;">
                  <strong>Rs ${totalAmount.toLocaleString()}</strong>
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
      console.error("Failed to generate expense report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} variant="outline" disabled={isLoading}>
      <Printer className="mr-2 h-4 w-4" />
      {isLoading ? "Preparing..." : "Print Report"}
    </Button>
  );
}
