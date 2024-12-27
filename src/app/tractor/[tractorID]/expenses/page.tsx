import { getTractorExpenses } from "@/lib/actions/tractor-expense";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyTractorData from "@/components/shared/empty-tractor-data";
import { getTractorDetails } from "@/lib/actions/tractor";
import { CardDescription } from "@/components/ui/card";

export default async function TractorExpensesPage({
  params,
}: {
  params: Promise<{ tractorID: string }>;
}) {
  const tractorID = (await params).tractorID;
  const expenses = await getTractorExpenses(tractorID);

  const tractorDetails = await getTractorDetails(tractorID);
  console.log(tractorDetails);
  return (
    <section className="">
      <div className="mb-3">
        <h2 className="text-xl font-semibold">{tractorDetails.tractorName}</h2>
        <CardDescription className="text-base">
          {tractorDetails.tractorModel}
        </CardDescription>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Tractor Expenses</h3>
        <Button asChild>
          <Link href={`/tractor/${tractorID}/expenses/add-expense`}>
            Add Expense
          </Link>
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyTractorData title="expenses" />
      ) : (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id.toString()}>
                <TableCell>{expense.description}</TableCell>
                <TableCell>Rs {expense.amount.toLocaleString()}</TableCell>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString("en-GB")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
