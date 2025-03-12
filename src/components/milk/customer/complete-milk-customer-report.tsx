// components/milk/customer/complete-customer-report.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getMilkCustomerSummary } from "@/lib/actions/milk-customer-actions";
import { formatDatePattern, getDateRangeDescription } from "@/lib/utils";

interface CompleteCustomerReportProps {
  customerDetails: {
    customerName: string;
    totalDebit: number;
    totalPaid: number;
    balance: number;
  };
  customerId: string;
  year: string;
  month?: string;
  startDate?: string;
  endDate?: string;
}

interface CombinedEntry {
  date: string;
  type: "milk" | "payment" | "debit";
  quantity?: number;
  price?: number;
  amount: number;
  description?: string;
  runningBalance: number;
}

export default function CompleteCustomerReport({
  customerDetails,
  customerId,
  year,
  month,
  startDate,
  endDate,
}: CompleteCustomerReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      // Fetch customer data
      const { milkRecords, transactions } = await getMilkCustomerSummary(
        customerId,
        year,
        month,
        startDate,
        endDate
      );

      // Combine and sort milk records and transactions by date
      let runningBalance = 0;
      const combinedEntries: CombinedEntry[] = [
        ...milkRecords.map(
          (record): CombinedEntry => ({
            date: record.date,
            type: "milk",
            quantity: record.quantity,
            price: record.price,
            amount: record.amount,
            description: "Milk Supply",
            runningBalance: 0,
          })
        ),
        ...transactions.map(
          (transaction): CombinedEntry => ({
            date: transaction.date,
            type: transaction.type === "DEBIT" ? "debit" : "payment",
            amount:
              transaction.type === "DEBIT"
                ? transaction.amount
                : -transaction.amount,
            description: transaction.description,
            runningBalance: 0,
          })
        ),
      ]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((entry) => {
          runningBalance += entry.amount;
          return {
            ...entry,
            runningBalance,
          };
        });

      // Calculate totals by type
      const totals = combinedEntries.reduce(
        (acc, entry) => {
          if (entry.type === "milk") {
            acc.milkDebit += entry.amount;
          } else if (entry.type === "debit") {
            acc.otherDebit += entry.amount;
          } else if (entry.type === "payment") {
            acc.totalPaid += Math.abs(entry.amount);
          }
          return acc;
        },
        { milkDebit: 0, otherDebit: 0, totalPaid: 0 }
      );

      const printContent = `
        <html>
          <head>
            <title>Customer Account Statement</title>
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
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 20px;
              }
              .summary-item {
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
              .amount { text-align: right; }
              .debit { color: red; }
              .credit { color: green; }
              .type-label {
                font-weight: bold;
                text-transform: capitalize;
              }
              @media print {
                button { display: none; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Account Statement - ${customerDetails.customerName}</h1>
              <p>Period: ${getDateRangeDescription({
                startDate,
                endDate,
                selectedYear: year,
                selectedMonth: month,
              })}
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>Total Debit:</strong>
                <p class="debit">Rs ${(totals.milkDebit + totals.otherDebit)
                  .toFixed(0)
                  .toLocaleString()}</p>
              </div>
              
              <div class="summary-item">
                <strong>Total Paid:</strong>
                <p class="credit">Rs ${totals.totalPaid
                  .toFixed(0)
                  .toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Balance:</strong>
                <p class="${
                  customerDetails.balance >= 0 ? "debit" : "credit"
                }">Rs ${Math.abs(customerDetails.balance).toFixed(0)} ${
        customerDetails.balance > 0 ? "Dr" : "Cr"
      }</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                 
                  <th>Quantity (L)</th>
                  <th>Rate (Rs)</th>
                  <th>Debit (Rs)</th>
                  <th>Credit (Rs)</th>
                  <th class="amount">Balance (Rs)</th>
                </tr>
              </thead>
              <tbody>
                ${combinedEntries
                  .map(
                    (entry) => `
                  <tr>
                    <td>${formatDatePattern(entry.date)}</td>
                    <td>${entry.description || "-"}</td>
                    
                    <td>${entry.quantity || "-"}</td>
                    <td>${entry.price || "-"}</td>
                    <td class="amount">${
                      entry.amount > 0
                        ? entry.amount.toFixed(0).toLocaleString()
                        : "-"
                    }</td>
                    <td class="amount">${
                      entry.amount < 0
                        ? Math.abs(entry.amount).toFixed(0).toLocaleString()
                        : "-"
                    }</td>
                    <td class="amount ${
                      entry.runningBalance >= 0 ? "debit" : "credit"
                    }">Rs ${Math.abs(entry.runningBalance)
                      .toFixed(0)
                      .toLocaleString()} ${
                      entry.runningBalance > 0 ? "Dr" : "Cr"
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px; font-size: 14px;">
              <p><strong>Final Balance: Rs ${Math.abs(
                customerDetails.balance
              ).toFixed(0)} ${
        customerDetails.balance > 0 ? "Dr" : "Cr"
      }</strong></p>
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
      console.error("Failed to generate complete report:", error);
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
