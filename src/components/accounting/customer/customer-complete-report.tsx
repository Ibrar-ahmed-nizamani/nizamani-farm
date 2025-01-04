"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getCustomerWorks } from "@/lib/actions/work";
import { getCustomerTransactions } from "@/lib/actions/transaction";

interface CompleteReportProps {
  customerName: string;
  customerId: string;
  year: string;
}

interface CombinedEntry {
  date: string;
  type: "work" | "payment";
  description: string;
  debit?: number;
  payment?: number;
  netAmount: number;
  equipmentDetails?: string;
  tractorDetails?: string;
  runningBalance: number;
}

export default function CustomerCompleteReport({
  customerName,
  customerId,
  year,
}: CompleteReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      // Fetch works and transactions
      const [works, transactions] = await Promise.all([
        getCustomerWorks(customerId, year),
        getCustomerTransactions(customerId, year),
      ]);

      let runningBalance = 0;
      const combinedEntries: CombinedEntry[] = [
        ...works.map(
          (work): CombinedEntry => ({
            date: work.date,
            type: "work",
            description: "-",
            debit: work.totalAmount,
            netAmount: work.totalAmount,
            equipmentDetails: work.equipments
              .map((eq) => `${eq.name}: ${eq.hours}hrs - Rs${eq.amount}`)
              .join(", "),
            tractorDetails: `${work.tractor.tractorName} - ${work.tractor.tractorModel}`,
            runningBalance: 0,
          })
        ),
        ...transactions
          .filter((transaction) => transaction.type === "CREDIT")
          .map(
            (transaction): CombinedEntry => ({
              date: transaction.date,
              type: transaction.type,
              description:
                transaction.description ||
                (transaction.type === "CREDIT"
                  ? "Payment Received"
                  : "Additional Charge"),
              payment:
                transaction.type === "CREDIT" ? transaction.amount : undefined,
              debit:
                transaction.type === "DEBIT" ? transaction.amount : undefined,
              netAmount:
                transaction.type === "CREDIT"
                  ? -transaction.amount
                  : transaction.amount,
              runningBalance: 0,
            })
          ),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((entry) => {
          runningBalance += entry.netAmount;
          return {
            ...entry,
            runningBalance,
          };
        });

      const totalDebit = combinedEntries.reduce(
        (sum, entry) => sum + (entry.debit || 0),
        0
      );
      const totalCredit = combinedEntries.reduce(
        (sum, entry) => sum + (entry.payment || 0),
        0
      );
      const balance = totalDebit - totalCredit;

      const printContent = `
        <html>
          <head>
            <title>Customer Complete Report</title>
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
              .debit { color: #991b1b; }
              .credit { color: #166534; }
              .badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
              }
              .badge.work { background-color: #fee2e2; color: #991b1b; }
              .badge.credit { background-color: #dcfce7; color: #166534; }
              .badge.debit { background-color: #fee2e2; color: #991b1b; }
              @media print {
                button { display: none; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${customerName}</h1>
              <p>Complete Report for: ${year === "all" ? "All Years" : year}</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>Total Debit</strong>
                <p class="debit">Rs ${totalDebit.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Total Credit</strong>
                <p class="credit">Rs ${totalCredit.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Balance Due</strong>
                <p class="${balance > 0 ? "debit" : "credit"}">
                  Rs ${Math.abs(balance).toLocaleString()}
                </p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  
                  <th>Payment Detail</th>
                  <th>Tractor Details</th>
                  <th>Equipment Details</th>
                  <th class="amount">Debit</th>
                  <th class="amount">Credit</th>
                  <th class="amount">Balance</th>
                </tr>
              </thead>
              <tbody>
                ${combinedEntries
                  .map(
                    (entry) => `
                  <tr>
                    <td>${new Date(entry.date).toLocaleDateString("en-GB")}</td>
                    
                    <td>${entry.description}</td>
                    <td>${entry.tractorDetails || "-"}</td>
                    <td>${entry.equipmentDetails || "-"}</td>
                    <td class="amount">${
                      entry.debit ? `Rs ${entry.debit.toLocaleString()}` : "-"
                    }</td>
                    <td class="amount">${
                      entry.payment
                        ? `Rs ${entry.payment.toLocaleString()}`
                        : "-"
                    }</td>
                    <td class="amount ${
                      entry.runningBalance > 0 ? "debit" : "credit"
                    }">
                      Rs ${Math.abs(entry.runningBalance).toLocaleString()}
                      
                      ${entry.runningBalance > 0 ? "De" : "Cr"}
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <table class="total-table" style="width: auto; margin-left: auto; margin-bottom: 20px; border-bottom: 2px solid #ddd;">
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Debit:</strong>
                </td>
                <td class="amount debit" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${totalDebit.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Credit:</strong>
                </td>
                <td class="amount credit" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${totalCredit.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Balance Due:</strong>
                </td>
                <td class="amount ${balance > 0 ? "debit" : "credit"}" 
                    style="width: 150px; border: 2px solid #ddd;">
                  <strong>Rs ${Math.abs(balance).toLocaleString()}</strong>
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
      console.error("Failed to generate customer report:", error);
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
