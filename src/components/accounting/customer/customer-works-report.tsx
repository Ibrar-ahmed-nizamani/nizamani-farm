"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getCustomerWorks } from "@/lib/actions/work";
import { formatDatePattern, getDateRangeDescription } from "@/lib/utils";

interface CustomerWorksReportProps {
  customerName: string;
  customerId: string;
  year: string;
  month?: string;
  startDate?: string;
  endDate?: string;
}

export default function CustomerWorksReport({
  customerName,
  customerId,
  year,
  month,
  startDate,
  endDate,
}: CustomerWorksReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const works = await getCustomerWorks(
        customerId,
        year,
        month,
        startDate,
        endDate
      );

      // Sort works by date (oldest first)
      const sortedWorks = works.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const totalAmount = works.reduce(
        (sum, work) => sum + work.totalAmount,
        0
      );

      const printContent = `
        <html>
          <head>
            <title>Customer Works Report</title>
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
              .equipment-details {
                font-size: 11px;
                color: #666;
                margin-top: 4px;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${customerName} - Tractor Works Report</h2>
              <p>Period: ${getDateRangeDescription({
                selectedYear: year,
                endDate,
                selectedMonth: month,
                startDate,
              })}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tractor</th>
                  <th>Equipment & Hours</th>
                  <th>Work Detail</th>
                  <th>Driver</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${sortedWorks
                  .map(
                    (work) => `
                  <tr>
                    <td>${formatDatePattern(work.date)}</td>
                    <td>
                      ${work.tractor.tractorName}<br/>
                      <span class="equipment-details">${
                        work.tractor.tractorModel
                      }</span>
                    </td>
                    <td>
                      ${work.equipments
                        .map(
                          (eq: {
                            name: string;
                            hours: number;
                            amount: number;
                          }) =>
                            `${eq.name}: ${
                              eq.hours
                            }hrs - Rs${eq.amount.toLocaleString()}`
                        )
                        .join("<br/>")}
                    </td>
                    <td>${work.detail}</td>
                    <td>${work.driverName || "N/A"}</td>
                    <td class="amount">Rs ${work.totalAmount.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <table class="total-table">
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>Total Work Amount:</strong>
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
      console.error("Failed to generate works report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} variant="outline" disabled={isLoading}>
      <Printer className="mr-2 h-4 w-4" />
      {isLoading ? "Preparing..." : "Print Works"}
    </Button>
  );
}
