"use client";

import { Card, CardContent } from "@/components/ui/card";

interface MilkExpense {
  _id: string;
  amount: number;
  date: string;
  type: {
    _id: string;
    name: string;
  };
}

interface ExpensesByType {
  [key: string]: number;
}

export default function MilkExpensesSummary({
  expenses,
}: {
  expenses: MilkExpense[];
}) {
  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate expenses by type
  const expensesByType = expenses.reduce((acc: ExpensesByType, expense) => {
    const typeName = expense.type.name;
    acc[typeName] = (acc[typeName] || 0) + expense.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">Expense Summary</h3>
          <div className="flex flex-col md:flex-row">
            <div className=" mb-6 md:mb-0 md:pr-6 md:border-r border-gray-200">
              <p className=" font-medium  mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                Rs {totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className=" md:pl-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(expensesByType).map(([type, amount]) => (
                  <div
                    key={type}
                    className="bg-gray-50 p-2 rounded-lg flex items-center gap-1 "
                  >
                    <p className=" font-medium">{type} :</p>
                    <p className="text-lg  text-red-600">
                      Rs {amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
