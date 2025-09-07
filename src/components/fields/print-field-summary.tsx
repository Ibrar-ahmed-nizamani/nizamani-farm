"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { convertShareTypes } from "@/lib/utils";

interface Farmer {
  _id: string;
  name: string;
  shareType: string;
  allocatedArea: number;
  income: number;
  expenses: number;
  balance: number;
  farmerIncome: number;
  ownerIncome: number;
  farmerExpenses: number;
  ownerExpenses: number;
  farmerBalance: number;
  ownerBalance: number;
}

interface PrintFieldSummaryProps {
  field: {
    name: string;
    totalArea: number;
  };
  farmers: Farmer[];
  summary: {
    totalFarmerIncome: number;
    totalOwnerIncome: number;
    totalFarmerExpenses: number;
    totalOwnerExpenses: number;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    totalFarmerBalance: number;
    totalOwnerBalance: number;
  };
}

export default function PrintFieldSummary({
  field,
  farmers,
  summary,
}: PrintFieldSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      const printContent = `
        <html>
          <head>
            <title>Field Report: ${field.name}</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; padding: 15px; max-width: 1200px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
              .header h1 { font-size: 18px; margin: 0 0 5px 0; }
              .header p { margin: 3px 0; color: #666; }
              .info-box { padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; margin-bottom: 20px; }
              .info-box h2 { font-size: 14px; margin-top: 0; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .info-box p { margin: 5px 0; }
              .summary { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 15px; }
              .summary-item { flex: 1; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; }
              .split-summary { margin-bottom: 20px; border: 1px solid #ddd; }
              .split-header { background-color: #f5f5f5; padding: 8px 10px; font-weight: bold; border-bottom: 1px solid #ddd; }
              .split-content { padding: 10px; display: flex; }
              .split-column { flex: 1; padding: 0 10px; }
              .split-column h3 { font-size: 12px; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .split-column p { margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: 600; }
              .amount { text-align: right; }
              .income { color: green; }
              .expense { color: red; }
              .total-row { font-weight: bold; background-color: #f5f5f5; }
              @media print {
                button { display: none; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Field Report</h1>
              <p>Field: ${field.name}</p>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="info-box">
              <h2>زمين جي ڄاڻ</h2>
              <p><strong>زمين جو نالو:</strong> ${field.name}</p>
              <p><strong>ڪل ايراضي:</strong> ${field.totalArea} acres</p>
            </div>

            <div class="summary">
              <div class="summary-item">
                <strong>مجموعي خرچ:</strong>
                <p class="expense">Rs ${summary.totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>مجموعي آمدني:</strong>
                <p class="income">Rs ${summary.totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <strong>مجموعي بيلنس:</strong>
                <p class="${summary.balance >= 0 ? "income" : "expense"}">
                  Rs ${Math.abs(summary.balance).toLocaleString()} ${
        summary.balance >= 0 ? "Cr" : "Dr"
      }
                </p>
              </div>
            </div>

            <div class="split-summary">
              <div class="split-header">مجموعي خرچ، آمدني ۽ خالص بيلنس جي تقسيم</div>
              <div class="split-content">
                <div class="split-column">
                  <h3>خرچ جي ورهاست</h3>
                  <p><strong>زميندار جو ڪل خرچ:</strong> <span class="expense">Rs ${summary.totalOwnerExpenses.toLocaleString()}</span></p>
                  <p><strong>هارين جو ڪل خرچ:</strong> <span class="expense">Rs ${summary.totalFarmerExpenses.toLocaleString()}</span></p>
                </div>
                <div class="split-column">
                  <h3>آمدنيءَ جي ورهاست</h3>
                  <p><strong>زميندار جي ڪل آمدني:</strong> <span class="income">Rs ${summary.totalOwnerIncome.toLocaleString()}</span></p>
                  <p><strong>هارين جي ڪل آمدني:</strong> <span class="income">Rs ${summary.totalFarmerIncome.toLocaleString()}</span></p>
                </div>
                <div class="split-column">
                  <h3>بيلينس</h3>
                  <p><strong>زميندار جو ڪل بيلينس:</strong> 
                    <span class="${
                      summary.totalOwnerBalance >= 0 ? "income" : "expense"
                    }">
                      Rs ${Math.abs(
                        summary.totalOwnerBalance
                      ).toLocaleString()} ${
        summary.totalOwnerBalance >= 0 ? "Cr" : "Dr"
      }
                    </span>
                  </p>
                  <p><strong>هارين جو ڪل بيلينس:</strong> 
                    <span class="${
                      summary.totalFarmerBalance >= 0 ? "income" : "expense"
                    }">
                      Rs ${Math.abs(
                        summary.totalFarmerBalance
                      ).toLocaleString()} ${
        summary.totalFarmerBalance >= 0 ? "Cr" : "Dr"
      }
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <h2>هارين جو خلاصو</h2>
            <table>
              <thead>
                <tr>
                  <th>هارين جو نالو</th>
                  <th>حصو</th>
                  <th>ايراضي (ايڪڙ)</th>
                  <th class="amount">هاريءَ جو خرچ</th>
                  <th class="amount">زميندار جو خرچ</th>
                  <th class="amount">ڪل خرچ</th>
                  <th class="amount">هاريءَ جي آمدني</th>
                  <th class="amount">زميندار جي آمدني</th>
                  <th class="amount">ڪل آمدني</th>
                  <th class="amount">هاريءَ جو بيلنس</th>
                  <th class="amount">زميندار جو بيلنس</th>
                  <th class="amount">بيلنس</th>
                </tr>
              </thead>
              <tbody>
                ${farmers
                  .map(
                    (farmer) => `
                  <tr>
                    <td>${farmer.name}</td>
                    <td>${convertShareTypes(farmer.shareType, true)}</td>
                    <td>${farmer.allocatedArea}</td>
                    <td class="amount expense">Rs ${farmer.farmerExpenses.toLocaleString()}</td>
                    <td class="amount expense">Rs ${farmer.ownerExpenses.toLocaleString()}</td>
                    <td class="amount expense">Rs ${farmer.expenses.toLocaleString()}</td>
                    <td class="amount income">Rs ${farmer.farmerIncome.toLocaleString()}</td>
                    <td class="amount income">Rs ${farmer.ownerIncome.toLocaleString()}</td>
                    <td class="amount income">Rs ${farmer.income.toLocaleString()}</td>
                     <td class="amount ${
                       farmer.farmerBalance >= 0 ? "income" : "expense"
                     }">Rs ${farmer.farmerBalance.toLocaleString()}</td>
                    <td class="amount ${
                      farmer.ownerBalance >= 0 ? "income" : "expense"
                    }">Rs ${farmer.ownerBalance.toLocaleString()}</td>
                    <td class="amount ${
                      farmer.balance >= 0 ? "income" : "expense"
                    }">Rs ${farmer.balance.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="3"><strong>مجموعو</strong></td>
                  <td class="amount expense"><strong>Rs ${summary.totalFarmerExpenses.toLocaleString()}</strong></td>
                  <td class="amount expense"><strong>Rs ${summary.totalOwnerExpenses.toLocaleString()}</strong></td>
                  <td class="amount expense"><strong>Rs ${summary.totalExpenses.toLocaleString()}</strong></td>
                  <td class="amount income"><strong>Rs ${summary.totalFarmerIncome.toLocaleString()}</strong></td>
                  <td class="amount income"><strong>Rs ${summary.totalOwnerIncome.toLocaleString()}</strong></td>
                  <td class="amount income"><strong>Rs ${summary.totalIncome.toLocaleString()}</strong></td>
                  <td class="amount ${
                    summary.totalFarmerBalance >= 0 ? "income" : "expense"
                  }"><strong>Rs ${summary.totalFarmerBalance.toLocaleString()}</strong></td>
                  <td class="amount ${
                    summary.totalOwnerBalance >= 0 ? "income" : "expense"
                  }"><strong>Rs ${summary.totalOwnerBalance.toLocaleString()}</strong></td>
                  <td class="amount ${
                    summary.balance >= 0 ? "income" : "expense"
                  }"><strong>Rs ${summary.balance.toLocaleString()}</strong></td>
                </tr>
              </tbody>
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
      console.error("Failed to generate field report:", error);
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
