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
import { formatDatePattern } from "@/lib/utils";
import { DeleteWorkerTransaction } from "@/components/milk/worker/delete-worker-transaction";
import { EditWorkerTransaction } from "@/components/milk/worker/edit-worker-transaction";
import SummaryCards from "@/components/shared/summary-cards";
import PrintTransactionReport from "@/components/shared/print-transaction-report";

// Worker Transactions Page
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
  const yearsAndMonths = await getMilkWorkerDates(id);

  const debit = transactions.reduce(
    (acc, curr) => acc + (curr.type === "debit" ? curr.amount : 0),
    0
  );

  const credit = transactions.reduce(
    (acc, curr) => acc + (curr.type === "credit" ? curr.amount : 0),
    0
  );

  // Calculate total balance
  const balance = transactions.reduce(
    (acc, curr) => acc + (curr.type === "credit" ? curr.amount : -curr.amount),
    0
  );

  const ascendingSortedTransactions = transactions.sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Calculate running balance for each transaction
  let runningBalance = 0;
  const transactionsWithBalance = ascendingSortedTransactions.map(
    (transaction) => {
      runningBalance +=
        transaction.type === "credit"
          ? transaction.amount
          : -transaction.amount;
      return {
        ...transaction,
        runningBalance,
      };
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{worker.name}</h1>
        </div>

        <BackLink href="/milk/workers" linkText="Back to Workers" />
      </div>

      <SummaryCards
        cards={[
          {
            label: "Debit",
            value: debit,
            type: "expense",
          },
          {
            label: "Credit",
            value: credit,
            type: "income",
          },
          {
            label: "Balance",
            value: -balance,
            type: "due",
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <WorkerYearSelector records={yearsAndMonths} />
          <WorkerMonthSelector records={yearsAndMonths} />
        </div>
        <div className="flex items-center gap-4">
          <PrintTransactionReport
            title="Trader Transaction Report"
            personName={worker.name}
            transactions={transactionsWithBalance}
            year={year}
            month={month}
            summaryData={{
              totalDebit: debit,
              totalCredit: credit,
              balance: balance,
            }}
          />
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
              <TableHead>Detail</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead>Debit</TableHead>
              <TableHead className="text-center">
                Running Balance (Rs)
              </TableHead>
              <TableHead className="w-[80px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsWithBalance.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{formatDatePattern(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="text-green-600">
                  {transaction.type === "credit" &&
                    transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-red-600">
                  {transaction.type === "debit" &&
                    transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  {Math.abs(transaction.runningBalance)}
                  {transaction.runningBalance > 0 ? " Cr" : " Dr"}
                </TableCell>
                <TableCell className="flex gap-3 items-center justify-center">
                  <EditWorkerTransaction
                    workerId={id}
                    transaction={{
                      _id: transaction._id,
                      amount: transaction.amount,
                      date: transaction.date.toISOString(),
                      description: transaction.description,
                      type: transaction.type,
                    }}
                  />
                  <DeleteWorkerTransaction
                    workerId={worker._id}
                    transactionId={transaction._id}
                    date={formatDatePattern(transaction.date)}
                    amount={transaction.amount}
                    type={transaction.type}
                  />
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
