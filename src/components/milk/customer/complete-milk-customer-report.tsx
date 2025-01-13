// components/milk/customer/complete-customer-report.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getMilkCustomerSummary } from "@/lib/actions/milk-customer-actions";
import { formatDate, monthNumberToName } from "@/lib/utils";

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
}

interface CombinedEntry {
  date: string;
  type: "milk" | "payment";
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
}: CompleteCustomerReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      // Fetch customer data
      const { milkRecords, transactions } = await getMilkCustomerSummary(
        customerId,
        year,
        month
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
            runningBalance: 0,
          })
        ),
        ...transactions.map(
          (transaction): CombinedEntry => ({
            date: transaction.date,
            type: "payment",
            amount: -transaction.amount,
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

      const printContent = `
        <html>
          <head>
            <title>Customer Milk Report</title>
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
              .amount { text-align: right; }
              .debit { color: red; }
              .credit { color: green; }
              @media print {
                button { display: none; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${customerDetails.customerName}</h1>
              <p>Complete Report for: ${year === "all" ? "All Time" : year}${
        month ? ` - Month: ${monthNumberToName(Number(month))}` : ""
      }</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>Total Debit:</strong>
                <p class="debit">Rs ${customerDetails.totalDebit.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Total Paid:</strong>
                <p class="credit">Rs ${customerDetails.totalPaid.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Balance:</strong>
                <p class="${
                  customerDetails.balance >= 0 ? "debit" : "credit"
                }">Rs ${Math.abs(customerDetails.balance)} ${
        customerDetails.balance > 0 ? " Dr" : " Cr"
      }</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantity (L)</th>
                  <th>Price (Rs)</th>
                  <th>Description</th>
                  
                  <th>Credit</th>
                  <th>Debit</th>

                  <th class="amount">Balance (Rs)</th>
                </tr>
              </thead>
              <tbody>
                ${combinedEntries
                  .map(
                    (entry) => `
                  <tr>
                    <td>${formatDate(
                      new Date(entry.date).toLocaleDateString("en-GB")
                    )}</td>
                    <td>${entry.type === "milk" ? "Milk" : "Payment"}</td>
                    <td>${entry.quantity || "-"}</td>
                    <td>${entry.price || "-"}</td>
                    <td>${entry.description || "-"}</td>
                    <td>${
                      entry.amount < 0
                        ? Math.abs(entry.amount).toLocaleString()
                        : "-"
                    }</td>
                    <td>${
                      entry.amount > 0
                        ? Math.abs(entry.amount).toLocaleString()
                        : "-"
                    }</td>
                    <td class="amount ${
                      entry.runningBalance >= 0 ? "debit" : "credit"
                    }">Rs ${Math.abs(entry.runningBalance).toLocaleString()} ${
                      entry.runningBalance > 0 ? "Dr" : "Cr"
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px;">
              <p><strong>Final Balance: Rs ${Math.abs(
                customerDetails.balance
              )} ${customerDetails.balance > 0 ? " Dr" : " Cr"}</strong></p>
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
