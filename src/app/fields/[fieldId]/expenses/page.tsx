// app/fields/[id]/expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { getFieldExpenses } from "@/lib/actions/field";
import { getShareSettings } from "@/lib/actions/share-settings";
import { FieldExpense, ShareSetting } from "@/lib/type-definitions";

interface ExpenseType {
  id: string;
  name: string;
}

// Mapping of known expense type IDs to names
const knownExpenseTypes: Record<string, string> = {
  tractor: "Tractor Expenses",
  cultivator: "Cultivator Expenses",
  seeds: "Seeds",
  fertilizer: "Fertilizer",
  pesticides: "Pesticides",
  irrigation: "Irrigation",
};

export default function FieldExpensesPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [expenses, setExpenses] = useState<FieldExpense[]>([]);
  const [shareSettings, setShareSettings] = useState<ShareSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [expensesData, settingsData] = await Promise.all([
          getFieldExpenses(params.id),
          getShareSettings(),
        ]);
        setExpenses(expensesData);
        setShareSettings(settingsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const getExpenseTypeName = (expenseTypeId?: string) => {
    if (!expenseTypeId) return "Other";
    return knownExpenseTypes[expenseTypeId] || expenseTypeId;
  };

  // Helper to get farmer percentage based on share type and expense type
  const getFarmerPercentage = (shareType: string, expenseTypeId?: string) => {
    if (!expenseTypeId) return "-";

    const setting = shareSettings.find((s) => s.shareType === shareType);
    if (!setting) return "-";

    const allocation = setting.expenseAllocations.find(
      (a) => a.expenseTypeId === expenseTypeId
    );
    return allocation ? `${allocation.farmerPercentage}%` : "-";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Field Expenses</CardTitle>
          <Link href={`/fields/${params.id}/expenses/add`}>
            <Button>Add Expense</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No expenses recorded for this field yet. Click "Add Expense" to
              add one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Share Split (1/2)</TableHead>
                  <TableHead>Share Split (1/3)</TableHead>
                  <TableHead>Share Split (1/4)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>
                      {format(new Date(expense.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      {getExpenseTypeName(expense.expenseTypeId)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getFarmerPercentage("1/2", expense.expenseTypeId)}
                    </TableCell>
                    <TableCell>
                      {getFarmerPercentage("1/3", expense.expenseTypeId)}
                    </TableCell>
                    <TableCell>
                      {getFarmerPercentage("1/4", expense.expenseTypeId)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
