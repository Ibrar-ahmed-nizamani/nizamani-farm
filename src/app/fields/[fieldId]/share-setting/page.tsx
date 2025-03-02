import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import EmptyState from "@/components/shared/empty-state";
import BackLink from "@/components/ui/back-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getField } from "@/lib/actions/field";
import { getFieldShareExpenses } from "@/lib/actions/share-settings";
import AddExpenseForm from "@/components/fields/share-setting/add-expense-percent-form";
import EditExpenseModal from "@/components/fields/share-setting/edit-expense-percent";

export default async function ShareSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ fieldId: string }>;
  searchParams: Promise<{ shareType?: string }>;
}) {
  const { fieldId } = await params;
  const shareType = (await searchParams).shareType || "QUARTER"; // Default to QUARTER (1/4)

  const field = await getField(fieldId);
  const expenses = await getFieldShareExpenses(fieldId, shareType);

  const shareLabel =
    shareType === "HALF"
      ? "1/2 (50%)"
      : shareType === "THIRD"
      ? "1/3 (33.3%)"
      : "1/4 (25%)";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Share Settings</h1>
          <p className="text-muted-foreground text-lg">{shareLabel}</p>
        </div>
        <BackLink href={`/fields/${fieldId}`} linkText="Back to Field" />
      </div>

      <Tabs defaultValue={shareType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <Link
            href={`/fields/${fieldId}/share-setting?shareType=QUARTER`}
            className="w-full"
          >
            <TabsTrigger value="QUARTER" className="w-full">
              1/4 Share (25%)
            </TabsTrigger>
          </Link>
          <Link
            href={`/fields/${fieldId}/share-setting?shareType=HALF`}
            className="w-full"
          >
            <TabsTrigger value="HALF" className="w-full">
              1/2 Share (50%)
            </TabsTrigger>
          </Link>
          <Link
            href={`/fields/${fieldId}/share-setting?shareType=THIRD`}
            className="w-full"
          >
            <TabsTrigger value="THIRD" className="w-full">
              1/3 Share (33.3%)
            </TabsTrigger>
          </Link>
        </TabsList>

        <TabsContent value={shareType} className="mt-6">
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
              <p className="text-muted-foreground mb-4">
                Define expenses for farmers with {shareLabel} share
              </p>
              <AddExpenseForm fieldId={fieldId} shareType={shareType} />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Expense Share List</h2>

              {expenses.length > 0 ? (
                <Table className="border">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense Name</TableHead>
                      <TableHead>Farmer Share Percentage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>{expense.name}</TableCell>
                        <TableCell>
                          {expense.farmerExpenseSharePercentage}%
                        </TableCell>
                        <TableCell className="text-right">
                          <EditExpenseModal
                            expense={expense}
                            fieldId={fieldId}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  title="No expenses defined"
                  description={`Start by adding expenses for ${shareLabel} farmers`}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
