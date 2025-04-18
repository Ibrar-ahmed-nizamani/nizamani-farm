"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { getAllTractorWorks } from "@/lib/actions/work";
import { formatDatePattern } from "@/lib/utils";
import { format } from "date-fns";

interface PrintReportProps {
  tractorDetails: {
    tractorName: string;
    tractorModel: string;
    totalIncome: number;
    totalExpenses: number;
    revenue: number;
    year: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  };
  tractorId: string;
}

export default function PrintReport({
  tractorDetails,
  tractorId,
}: PrintReportProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Function to generate date range description for the report header
  const getDateRangeDescription = () => {
    if (tractorDetails.startDate && tractorDetails.endDate) {
      return `${format(tractorDetails.startDate, "PPP")} to ${format(
        tractorDetails.endDate,
        "PPP"
      )}`;
    } else if (tractorDetails.startDate) {
      return `From ${formatDatePattern(tractorDetails.startDate)}`;
    } else if (tractorDetails.endDate) {
      return `Until ${formatDatePattern(tractorDetails.endDate)}`;
    } else if (
      tractorDetails.year !== "all" &&
      tractorDetails.month &&
      tractorDetails.month !== "all"
    ) {
      const monthDate = new Date(
        parseInt(tractorDetails.year),
        parseInt(tractorDetails.month) - 1,
        1
      );
      return `${monthDate.toLocaleString("default", {
        month: "long",
      })} ${tractorDetails.year}`;
    } else if (tractorDetails.year !== "all") {
      return `Year ${tractorDetails.year}`;
    } else {
      return "All Time";
    }
  };

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      // Call the server action with all filter parameters
      const works = await getAllTractorWorks(tractorId, {
        year: tractorDetails.year,
        month: tractorDetails.month,
        startDate: tractorDetails.startDate,
        endDate: tractorDetails.endDate,
      });

      // Sort works in descending order by date
      const sortedWorks = [...works].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const dateRangeDescription = getDateRangeDescription();

      const printContent = `
        <html>
          <head>
            <title>Tractor Works Report</title>
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
              .summary {
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                gap: 15px;
                font-size: 11px;
              }
              .summary-item {
                flex: 1;
                padding: 8px;
                background-color: #f9f9f9;
                border: 1px solid #eee;
              }
              .summary-item strong {
                display: block;
                margin-bottom: 3px;
              }
              .summary-item p {
                margin: 0;
                font-size: 13px;
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
              .equipment-details {
                font-size: 10px;
              }
              .total-row {
                font-weight: bold;
                background-color: #f9f9f9;
              }
              .serial-no {
                width: 30px;
                text-align: center;
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
              <p>Report for: ${dateRangeDescription}</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>Total Income</strong>
                <p style="color: green;">Rs ${tractorDetails.totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Total Expenses</strong>
                <p style="color: red;">Rs ${tractorDetails.totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>Net Revenue</strong>
                <p style="color: ${
                  tractorDetails.revenue >= 0 ? "green" : "red"
                };">
                  Rs ${tractorDetails.revenue.toLocaleString()}
                </p>
              </div>
            </div>

            <table style="margin-bottom: 20px; border-bottom: 2px solid #ddd;">
              <thead>
                <tr>
                  <th class="serial-no">No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Equipment Details</th>
                  <th>Work Details</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${sortedWorks
                  .map(
                    (work, index) => `
                  <tr>
                    <td class="serial-no">${index + 1}</td>
                    <td>${formatDatePattern(work.date)}</td>
                    <td>${work.customerName}</td>
                    <td>
                      ${work.equipments
                        .map(
                          (eq: {
                            name: string;
                            hours: number;
                            amount: number;
                          }) =>
                            `<div class="equipment-details">${eq.name}: ${
                              eq.hours
                            } hrs - Rs ${eq.amount.toLocaleString()}</div>`
                        )
                        .join("")}
                    </td>
                    <td>${work.detail}</td>
                    <td class="amount">Rs ${work.totalAmount.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <!-- Add total row after the table -->
            <div style="page-break-inside: avoid; margin-top: 20px;">
              <table style="width: 100%;">
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;">Total Amount:</td>
                  <td class="amount" style="width: 150px;">Rs ${sortedWorks
                    .reduce((sum, work) => sum + work.totalAmount, 0)
                    .toLocaleString()}</td>
                </tr>
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
      console.error("Failed to generate print report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePrint} variant="outline" disabled={isLoading}>
      <Printer className="mr-2 h-4 w-4" />
      {isLoading ? "Preparing..." : "Print Work Report"}
    </Button>
  );
}
