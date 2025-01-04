"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getCustomerTransactions } from "@/lib/actions/transaction";

interface TransactionReportProps {
  customerName: string;

  customerId: string;
  year: string;
}

interface TransactionReportProps {
  customerName: string;
  customerId: string;
  year: string;
}

export default function TransactionReport({
  customerName,
  customerId,
  year,
}: TransactionReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const transactions = await getCustomerTransactions(customerId, year);

      // Filter only CREDIT transactions
      const creditTransactions = transactions
        .filter((transaction) => transaction.type === "CREDIT")
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      const totalAmount = creditTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      const printContent = `
        <html>
          <head>
            <title>Transaction Report</title>
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
              .header h2 {
                font-size: 18px;
                margin: 0 0 5px 0;
                text-transform: capitalize;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              .amount { text-align: right; }
              .total-table {
                width: auto;
                margin-left: auto;
                margin-bottom: 20px;
                border-bottom: 2px solid #ddd;
              }
              .total-row td {
                font-weight: bold;
                background-color: #f5f5f5;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${customerName} - Payment Report</h2>
              <p>Period: ${year === "all" ? "All Time" : year}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${creditTransactions
                  .map(
                    (transaction) => `
                  <tr>
                    <td>${new Date(transaction.date).toLocaleDateString(
                      "en-GB"
                    )}</td>
                    <td>${transaction.description || "Payment Received"}</td>
                    <td class="amount">Rs ${transaction.amount.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <table class="total-table">
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Amount Paid:</strong>
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
      console.error("Failed to generate transaction report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} variant="outline" disabled={isLoading}>
      <Printer className="mr-2 h-4 w-4" />
      {isLoading ? "Preparing..." : "Print Payments"}
    </Button>
  );
}
