// app/fields/[fieldId]/farmers/[farmerId]/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BackLink from "@/components/ui/back-link";
import EmptyState from "@/components/shared/empty-state";
import SummaryCards from "@/components/shared/summary-cards";
import { formatDatePattern } from "@/lib/utils";
import { PlusIcon, ArrowRight } from "lucide-react";
import { getFieldFarmer, getFieldFarmerExpenses } from "@/lib/actions/farmer";
import { Card, CardContent } from "@/components/ui/card";
import PrintFarmerSummary from "@/components/fields/print-farmer-summary";

export default async function FarmerFieldPage({
  params,
}: {
  params: Promise<{ fieldId: string; farmerId: string }>;
}) {
  const { fieldId, farmerId } = await params;

  const farmer = await getFieldFarmer(farmerId);
  const { expenses, summary } = await getFieldFarmerExpenses(farmerId);

  // Calculate total expenses and income
  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + (curr.type === "expense" ? curr.amount : 0),
    0
  );

  const totalIncome = expenses.reduce(
    (acc, curr) => acc + (curr.type === "income" ? curr.amount : 0),
    0
  );

  const balance = totalIncome - totalExpenses;

  // Get the share percentage based on the farmer&apos;s share type
  const getSharePercentage = (shareType: string): number => {
    switch (shareType) {
      case "1/2":
        return 50;
      case "1/3":
        return 33.33;
      case "1/4":
        return 25;
      default:
        return 0;
    }
  };

  // Calculate income split
  const farmerSharePercentage = getSharePercentage(farmer.shareType);
  const farmerIncome = Math.round((totalIncome * farmerSharePercentage) / 100);
  const ownerIncome = totalIncome - farmerIncome;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{farmer.name}&apos;s Field</h1>
          <p className="text-muted-foreground">
            Main Field: {farmer.fieldName} - Allocated Area:{" "}
            {farmer.allocatedArea} acres - Share Type:{" "}
            {getSharePercentage(farmer.shareType)}%
          </p>
        </div>
        <div className="flex gap-4">
          <PrintFarmerSummary
            farmer={farmer}
            expenses={expenses}
            summary={summary}
          />
          <BackLink href={`/fields/${fieldId}`} linkText="Back to Field" />
        </div>
      </div>

      {/* First row of summary cards */}
      <SummaryCards
        cards={[
          {
            label: "Total Expenses",
            value: totalExpenses,
            type: "expense",
          },
          {
            label: "Total Income",
            value: totalIncome,
            type: "income",
          },
          {
            label: "Balance",
            value: balance,
            type: balance >= 0 ? "income" : "expense",
          },
        ]}
      />

      {/* Updated card to show both expenses, income split, and net balance */}
      <Card className="">
        <CardContent className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expenses Column */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Expenses Split</h3>

            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Owner&apos;s Expenses:</h4>
              <p className="font-bold text-red-600">
                Rs {summary.totalOwnerExpenses.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Farmer&apos;s Expenses:</h4>
              <p className="font-bold text-red-600">
                Rs {summary.totalFarmerExpenses.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Income Column */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              Income Split ({farmerSharePercentage}% Farmer)
            </h3>

            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Owner&apos;s Income:</h4>
              <p className="font-bold text-green-600">
                Rs {ownerIncome.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Farmer&apos;s Income:</h4>
              <p className="font-bold text-green-600">
                Rs {farmerIncome.toLocaleString()}
              </p>
            </div>
          </div>

          {/* New section for Net Balance */}
          <div className="space-y-2 col-span-1 md:col-span-2 mt-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Net Balance</h3>

            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Owner&apos;s Net Balance:</h4>
              <p
                className={`font-bold ${
                  ownerIncome - summary.totalOwnerExpenses >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Rs {(ownerIncome - summary.totalOwnerExpenses).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <h4 className="font-medium">Farmer&apos;s Net Balance:</h4>
              <p
                className={`font-bold ${
                  farmerIncome - summary.totalFarmerExpenses >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Rs{" "}
                {(farmerIncome - summary.totalFarmerExpenses).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Field Expenses</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link
              href={`/fields/${fieldId}/farmers/${farmerId}/transactions`}
              className="flex items-center gap-2"
            >
              Transactions <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link
              href={`/fields/${fieldId}/farmers/${farmerId}/field-transactions`}
              className="flex items-center gap-2"
            >
              <PlusIcon className="size-4" /> Add Field Transaction
            </Link>
          </Button>
        </div>
      </div>

      {expenses.length > 0 ? (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Expense (Rs)</TableHead>
              <TableHead>Income (Rs)</TableHead>
              <TableHead className="text-center w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>{formatDatePattern(expense.date)}</TableCell>
                <TableCell>
                  {expense.type === "expense" ? (
                    <>
                      {expense.expenseType ? expense.expenseType : "-"}
                      {expense.sharePercentage !== null &&
                        expense.sharePercentage > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({expense.sharePercentage}% farmer)
                          </span>
                        )}
                    </>
                  ) : (
                    <>
                      Income
                      <span className="text-xs text-muted-foreground ml-1">
                        ({farmerSharePercentage}% farmer)
                      </span>
                    </>
                  )}
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell className="text-red-600">
                  {expense.type === "expense"
                    ? expense.amount.toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell className="text-green-600">
                  {expense.type === "income"
                    ? expense.amount.toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  {/* Actions remain the same */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No expenses found"
          description="Start by adding your first field transaction"
          link={`/fields/${fieldId}/farmers/${farmerId}/field-transactions`}
          linkText="Add Field Transaction"
        />
      )}
    </div>
  );
}
