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
import { formatDatePattern, getDateRangeDescription } from "@/lib/utils";
import { PlusIcon, ArrowRight } from "lucide-react";
import { getFieldFarmer, getFieldFarmerExpenses } from "@/lib/actions/farmer";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import PrintFarmerSummary from "@/components/fields/print-farmer-summary";
import { EditFieldTransaction } from "@/components/fields/edit-field-transaction";
import { DeleteFieldTransaction } from "@/components/fields/delete-field-transaction";
import { getExpenseTypes } from "@/lib/actions/share-settings";
import DateRangeSelector from "@/components/shared/date-range-selector";
import ExpenseTypeSelector from "@/components/shared/expense-type-selector";
import DeleteFarmerButton from "@/components/fields/delete-farmer-button";

interface SearchParams {
  startDate?: string;
  endDate?: string;
  year?: string;
  month?: string;
  expenseType?: string;
}

export default async function FarmerFieldPage({
  params,
  searchParams,
}: {
  params: Promise<{ fieldId: string; farmerId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { fieldId, farmerId } = await params;
  const { startDate, endDate, year, month, expenseType } = await searchParams;

  const farmer = await getFieldFarmer(farmerId);
  const { expenses, summary, years, months } = await getFieldFarmerExpenses(
    farmerId,
    {
      startDate,
      endDate,
      year,
      month,
      expenseType,
    }
  );
  

  // Get expense types filtered by farmer's share type
  const expenseTypes = await getExpenseTypes(farmer.shareType);

  // Get date range description for display
  const dateRangeDescription = getDateRangeDescription({
    selectedYear: year || "all",
    selectedMonth: month,
    startDate,
    endDate,
  });
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
         
          <DeleteFarmerButton 
            farmerId={farmerId} 
            farmerName={farmer.name} 
            fieldId={fieldId} 
          />
           <PrintFarmerSummary
            farmer={farmer}
            expenses={expenses}
            summary={summary}
          />
          <BackLink href={`/fields/${fieldId}`} linkText="Back to Field" />
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <div className="flex gap-4 items-center justify-between mb-2">
          <CardDescription>{dateRangeDescription}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <DateRangeSelector availableYears={years} availableMonths={months} />
          <ExpenseTypeSelector expenseTypes={expenseTypes} />
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
        <CardContent className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="space-y-2 col-span-1 ">
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
              <TableHead>Total Income</TableHead>
              <TableHead>Farmer Income</TableHead>
              <TableHead>Owner Income</TableHead>
              <TableHead>Total Expense</TableHead>
              <TableHead>Farmer Expense</TableHead>
              <TableHead>Owner Expense</TableHead>
              <TableHead className="text-center w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              // Calculate expense split for each row
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
              } else if (expense.type === "income") {
                farmerIncome = Math.round(
                  (expense.amount * farmerSharePercentage) / 100
                );
                ownerIncome = expense.amount - farmerIncome;
              }

              return (
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
                  <TableCell className="text-green-600">
                    {expense.type === "income"
                      ? expense.amount.toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {expense.type === "income" && farmerIncome > 0
                      ? farmerIncome.toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {expense.type === "income" && ownerIncome > 0
                      ? ownerIncome.toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {expense.type === "expense"
                      ? expense.amount.toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {expense.type === "expense" && farmerExpense > 0
                      ? farmerExpense.toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {expense.type === "expense" && ownerExpense > 0
                      ? ownerExpense.toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2">
                    {/* Add edit and delete actions */}
                    <EditFieldTransaction
                      fieldId={fieldId}
                      farmerId={farmerId}
                      expense={{
                        _id: expense._id,
                        type: expense.type,
                        expenseType: expense.expenseType,
                        expenseTypeId: expense.expenseTypeId,
                        amount: expense.amount,
                        date: expense.date,
                        description: expense.description,
                        farmerShare: expense.sharePercentage || 0,
                      }}
                      expenseTypes={expenseTypes}
                    />
                    <DeleteFieldTransaction
                      fieldId={fieldId}
                      farmerId={farmerId}
                      transaction={{
                        _id: expense._id,
                        type: expense.type,
                        amount: expense.amount,
                        date: expense.date,
                        description: expense.description,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
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
