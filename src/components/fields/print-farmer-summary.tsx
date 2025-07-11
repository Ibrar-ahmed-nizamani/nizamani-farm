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
              .split-column p {
                margin: 5px 0;
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
              <h2>هاري ۽ زمين جي ڄاڻ</h2>
              <p> <strong>ھاري جو نالو</strong>: ${farmer.name} :</p>
              <p> <strong>زمين جو نالو</strong>: ${farmer.fieldName}</p>
              <p> ايڪر ${
                farmer.allocatedArea
              } :<strong>مختص ٿيل علائقو</strong></p>
              <p> ${farmer.shareType} (${
        summary.farmerSharePercentage
      }%) :<strong>حصيداري</strong></p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>مڪمل خرچ:</strong>
                <p class="expense">Rs ${totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>مڪمل آمدني:</strong>
                <p class="income">Rs ${totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>خالص بيلنس:</strong>
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
              <div class="split-header">خرچ، آمدني ۽ خالص بيلنس جي تقسيم</div>
              <div class="split-content">
                <div class="split-column">
                  <h3>خرچ جي ورهاست</h3>
                  <p><strong>زميندار جو خرچ:</strong> <span class="expense">Rs ${summary.totalOwnerExpenses.toLocaleString()}</span></p>
                  <p><strong>ھاري جو خرچ:</strong> <span class="expense">Rs ${summary.totalFarmerExpenses.toLocaleString()}</span></p>
                </div>
                <div class="split-column">
                  <h3> ( هاريءَ جو حصو %${
                    summary.farmerSharePercentage
                  }) آمدنيءَ جي ورهاست </h3>
                  <p><strong>زميندار جي آمدني</strong> <span class="income">Rs ${summary.ownerIncome.toLocaleString()}</span></p>
                  <p><strong>ھاري جي آمدني:</strong> <span class="income">Rs ${summary.farmerIncome.toLocaleString()}</span></p>
                </div>
                <div class="split-column">
                  <h3>بقايا</h3>
                  <p><strong>زميندار جو بيلينس</strong> 
                    <span class="${
                      ownerNetBalance >= 0 ? "income" : "expense"
                    }">
                      Rs ${Math.abs(ownerNetBalance).toLocaleString()} ${
        ownerNetBalance >= 0 ? "Cr" : "Dr"
      }
                    </span>
                  </p>
                  <p><strong>ھاري جو بيلينس</strong> 
                    <span class="${
                      farmerNetBalance >= 0 ? "income" : "expense"
                    }">
                      Rs ${Math.abs(farmerNetBalance).toLocaleString()} ${
        farmerNetBalance >= 0 ? "Cr" : "Dr"
      }
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <h2>Field Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>تاريخ</th>
                  <th>Type</th>
                  <th>تفصيل</th>
                  <th class="amount">ڪل آمدني</th>
                  <th class="amount">ھاري جي آمدني</th>
                  <th class="amount">زميندار جي آمدني</th>
                  <th class="amount">ڪل خرچ</th>
                  <th class="amount">ھاري جو خرچ</th>
                  <th class="amount">زميندار جو خرچ</th>
                  <th class="amount">بيلينس</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  let runningBalance = 0;
                  return sortedExpenses
                    .map((expense) => {
                      let farmerExpense = 0;
                      let ownerExpense = 0;
                      let farmerIncome = 0;
                      let ownerIncome = 0;

                      if (expense.type === "expense") {
                        const sharePercentage = expense.sharePercentage || 0;
                        farmerExpense = Math.round(
                          (expense.amount * sharePercentage) / 100
                        );
                        ownerExpense = expense.amount - farmerExpense;
                        runningBalance -= expense.amount;
                      } else if (expense.type === "income") {
                        farmerIncome = Math.round(
                          (expense.amount * summary.farmerSharePercentage) / 100
                        );
                        ownerIncome = expense.amount - farmerIncome;
                        runningBalance += expense.amount;
                      }

                      return `
                        <tr>
                          <td>${
                            typeof expense.date === "string"
                              ? formatDatePattern(expense.date)
                              : formatDatePattern(expense.date.toISOString())
                          }</td>
                          <td>${
                            expense.type === "expense"
                              ? expense.expenseType || "---"
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
                            expense.type === "income" ? "income" : ""
                          }">
                            ${
                              expense.type === "income"
                                ? expense.amount.toLocaleString()
                                : "-"
                            }
                          </td>
                          <td class="amount ${
                            expense.type === "income" && farmerIncome > 0
                              ? "income"
                              : ""
                          }">
                            ${
                              expense.type === "income" && farmerIncome > 0
                                ? farmerIncome.toLocaleString()
                                : "-"
                            }
                          </td>
                          <td class="amount ${
                            expense.type === "income" && ownerIncome > 0
                              ? "income"
                              : ""
                          }">
                            ${
                              expense.type === "income" && ownerIncome > 0
                                ? ownerIncome.toLocaleString()
                                : "-"
                            }
                          </td>
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
                            expense.type === "expense" && farmerExpense > 0
                              ? "expense"
                              : ""
                          }">
                            ${
                              expense.type === "expense" && farmerExpense > 0
                                ? farmerExpense.toLocaleString()
                                : "-"
                            }
                          </td>
                          <td class="amount ${
                            expense.type === "expense" && ownerExpense > 0
                              ? "expense"
                              : ""
                          }">
                            ${
                              expense.type === "expense" && ownerExpense > 0
                                ? ownerExpense.toLocaleString()
                                : "-"
                            }
                          </td>
                          <td class="amount ${
                            runningBalance >= 0 ? "income" : "expense"
                          }">
                            Rs ${Math.abs(runningBalance).toLocaleString()} ${
                        runningBalance >= 0 ? "Cr" : "Dr"
                      }
                          </td>
                        </tr>
                      `;
                    })
                    .join("");
                })()}
              </tbody>
            </table>

            <table class="total-table">
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>ڪل خرچ:</strong>
                </td>
                <td class="amount expense" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${totalExpenses.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>ھاري جو خرچ:</strong>
                </td>
                <td class="amount expense" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${summary.totalFarmerExpenses.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>زميندار جو خرچ
:</strong>
                </td>
                <td class="amount expense" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${summary.totalOwnerExpenses.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>ڪل آمدني:</strong>
                </td>
                <td class="amount income" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${totalIncome.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>ھاري جي آمدني:</strong>
                </td>
                <td class="amount income" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${summary.farmerIncome.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="text-align: right; padding-right: 20px; border: none;">
                  <strong>زميندار جي آمدني:</strong>
                </td>
                <td class="amount income" style="width: 150px; border: 1px solid #ddd;">
                  Rs ${summary.ownerIncome.toLocaleString()}
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
