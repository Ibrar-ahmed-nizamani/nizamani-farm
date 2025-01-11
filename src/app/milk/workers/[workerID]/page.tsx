import { format } from "date-fns";
import {
  getMilkWorker,
  getMilkWorkerDates,
  getMilkWorkerTransactions,
} from "@/lib/actions/milk-worker";
import {
  WorkerMonthSelector,
  WorkerYearSelector,
} from "@/components/milk/worker/selectors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EmptyState from "@/components/shared/empty-state";
import BackLink from "@/components/ui/back-link";

export default async function WorkerPage({
  params,
  searchParams,
}: {
  params: Promise<{ workerID: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const id = (await params).workerID;
  const { year, month } = await searchParams;
  const worker = await getMilkWorker(id);
  const transactions = await getMilkWorkerTransactions(id, year, month);
  const records = await getMilkWorkerDates(id);
  console.log(records);

  const balance = transactions.reduce(
    (acc, curr) => acc + (curr.type === "credit" ? curr.amount : -curr.amount),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{worker.name}</h1>
          <p className="text-muted-foreground">
            Current Balance: Rs {balance.toLocaleString()}
          </p>
        </div>

        <BackLink href="/milk/workers" linkText="Back to Workers" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <WorkerYearSelector records={records} />
          <WorkerMonthSelector records={records} />
        </div>
        <div>
          <Button asChild>
            <Link href={`/milk/workers/${worker._id}/add-worker-transaction`}>
              Add Transaction
            </Link>
          </Button>
        </div>
      </div>
      {transactions.length > 0 ? (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount (Rs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>
                  {format(new Date(transaction.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell
                  className={
                    transaction.type === "credit"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {transaction.type.charAt(0).toUpperCase() +
                    transaction.type.slice(1)}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="text-right">
                  {transaction.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No transaction found"
          description="Start by adding your first worker transaction"
          link={`/milk/workers/${worker._id}/add-worker-transaction`}
          linkText="Add Worker Transaction"
        />
      )}
    </div>
  );
}
