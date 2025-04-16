"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getCustomerTransactions } from "@/lib/actions/transaction";
import { formatDatePattern } from "@/lib/utils";

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

      // Sort by date in ascending order (oldest to newest)
      const sortedTransactions = transactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate running balance
      let runningBalance = 0;
      const transactionsWithBalance = sortedTransactions.map((transaction) => {
        const amount = transaction.amount;
        // For CREDIT transactions, decrease the balance (payments reduce what's owed)
        // For DEBIT transactions, increase the balance (charges increase what's owed)
        const netAmount = transaction.type === "CREDIT" ? -amount : amount;
        runningBalance += netAmount;

        return {
          ...transaction,
          runningBalance,
        };
      });

      // Calculate total amounts
      const totalDebit = sortedTransactions
        .filter((transaction) => transaction.type === "DEBIT")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const totalCredit = sortedTransactions
        .filter((transaction) => transaction.type === "CREDIT")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const balance = totalDebit - totalCredit;

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
              .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
              }
              .summary-item {
                padding: 12px;
                border-radius: 6px;
                background-color: white;
                border: 1px solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .summary-item strong {
                display: block;
                font-size: 13px;
                color: #64748b;
                margin-bottom: 4px;
              }
              .summary-item p {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
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
              .debit { color: #991b1b; }
              .credit { color: #166534; }
              .transaction-type {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: 500;
              }
              .transaction-type.CREDIT { background-color: #dcfce7; color: #166534; }
              .transaction-type.DEBIT { background-color: #fee2e2; color: #991b1b; }
              .total-table {
                width: auto;
                margin-left: auto;
                margin-bottom: 20px;
                border-bottom: 2px solid #ddd;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${customerName} - Transaction Report</h2>
              <p>Period: ${year === "all" ? "All Time" : year}</p>
            </div>

            

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th class="amount">Debit</th>
                  <th class="amount">Credit</th>
                  <th class="amount">Balance</th>
                </tr>
              </thead>
              <tbody>
                ${transactionsWithBalance
                  .map(
                    (transaction) => `
                  <tr>
                    <td>${formatDatePattern(transaction.date)}</td>
                    <td>
                      <span class="transaction-type ${transaction.type}">
                        ${transaction.type === "CREDIT" ? "Payment" : "Debit"}
                      </span>
                    </td>
                    <td>${
                      transaction.description ||
                      (transaction.type === "CREDIT"
                        ? "Payment Received"
                        : "Additional Charge")
                    }</td>
                    <td class="amount">
                      ${
                        transaction.type === "DEBIT"
                          ? `Rs ${transaction.amount.toLocaleString()}`
                          : "-"
                      }
                    </td>
                    <td class="amount">
                      ${
                        transaction.type === "CREDIT"
                          ? `Rs ${transaction.amount.toLocaleString()}`
                          : "-"
                      }
                    </td>
                    <td class="amount ${
                      transaction.runningBalance > 0 ? "debit" : "credit"
                    }">
                      Rs ${Math.abs(
                        transaction.runningBalance
                      ).toLocaleString()} ${
                      transaction.runningBalance > 0 ? "Dr" : "Cr"
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
                  <strong>Total Other Debits:</strong>
                </td>
                <td class="amount debit" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${totalDebit.toLocaleString()}
                </td>
              </tr>
              
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Credit:</strong>
                </td>
                <td class="amount ${
                  balance > 0 ? "debit" : "credit"
                }" style="width: 150px; border: 2px solid #ddd;">
                  <strong>Rs ${Math.abs(totalCredit).toLocaleString()} </strong>
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
      {isLoading ? "Preparing..." : "Print Transactions"}
    </Button>
  );
}
