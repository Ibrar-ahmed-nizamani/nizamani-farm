// components/fields/field-summary.tsx
import { Card, CardContent } from "@/components/ui/card";
import SummaryCards from "@/components/shared/summary-cards";

interface FieldSummaryProps {
  summary: {
    totalExpenses: number;
    totalIncome: number;
    balance: number;
    totalOwnerExpenses: number;
    totalFarmerExpenses: number;
    totalOwnerIncome: number;
    totalFarmerIncome: number;
    totalOwnerBalance: number;
    totalFarmerBalance: number;
  };
}

export default function FieldSummary({ summary }: FieldSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Overview Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: "Total Expenses",
            value: summary.totalExpenses,
            type: "expense",
          },
          {
            label: "Total Income",
            value: summary.totalIncome,
            type: "income",
          },
          {
            label: "Balance",
            value: summary.balance,
            type: summary.balance >= 0 ? "income" : "expense",
          },
        ]}
      />

      {/* Detailed Breakdown Card */}
      <Card className="w-full">
        <CardContent className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expenses Column */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Expenses Split</h3>

            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Owner's Expenses:</h4>
              <p className="font-bold text-red-600">
                Rs {summary.totalOwnerExpenses.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Farmers' Expenses:</h4>
              <p className="font-bold text-red-600">
                Rs {summary.totalFarmerExpenses.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Income Column */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Income Split</h3>

            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Owner's Income:</h4>
              <p className="font-bold text-green-600">
                Rs {summary.totalOwnerIncome.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Farmers' Income:</h4>
              <p className="font-bold text-green-600">
                Rs {summary.totalFarmerIncome.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Net Balance */}
          <div className="space-y-2 col-span-1 md:col-span-2 mt-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Net Balance</h3>

            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Owner's Net Balance:</h4>
              <p
                className={`font-bold ${
                  summary.totalOwnerBalance >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Rs {summary.totalOwnerBalance.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Farmers' Net Balance:</h4>
              <p
                className={`font-bold ${
                  summary.totalFarmerBalance >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Rs {summary.totalFarmerBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
