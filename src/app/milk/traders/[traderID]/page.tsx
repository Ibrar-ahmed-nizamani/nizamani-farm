// [traderID]/page.tsx (trader details page)
import {
  getMilkTrader,
  getMilkTraderDates,
  getMilkTraderTransactions,
} from "@/lib/actions/milk-trader";

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
import {
  WorkerMonthSelector,
  WorkerYearSelector,
} from "@/components/milk/worker/selectors";
import { DeleteTraderTransaction } from "@/components/milk/traders/delete-trader-transaction";
import { EditTraderTransaction } from "@/components/milk/traders/edit-trader-transaction";

export default async function TraderPage({
  params,
  searchParams,
}: {
  params: Promise<{ traderID: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const id = (await params).traderID;
  const { year, month } = await searchParams;
  const trader = await getMilkTrader(id);
  const transactions = await getMilkTraderTransactions(id, year, month);
  const yearsAndMonths = await getMilkTraderDates(id);

  // Calculate total balance
  const balance = transactions.reduce(
    (acc, curr) => acc + (curr.type === "credit" ? curr.amount : -curr.amount),
    0
  );

  // Calculate running balance for each transaction
  let runningBalance = 0;
  const transactionsWithBalance = transactions.map((transaction) => {
    runningBalance +=
      transaction.type === "credit" ? transaction.amount : -transaction.amount;
    return {
      ...transaction,
      runningBalance,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{trader.name}</h1>
          <p className="text-muted-foreground">
            Current Balance: Rs {Math.abs(balance)} {balance < 0 ? "Dr" : "Cr"}
          </p>
        </div>

        <BackLink href="/milk/traders" linkText="Back to Traders" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <WorkerYearSelector records={yearsAndMonths} />
          <WorkerMonthSelector records={yearsAndMonths} />
        </div>
        <div>
          <Button asChild>
            <Link href={`/milk/traders/${id}/add-transaction`}>
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
                  <EditTraderTransaction
                    traderId={id}
                    transaction={{
                      _id: transaction._id,
                      amount: transaction.amount,
                      date: transaction.date.toISOString(),
                      description: transaction.description,
                      type: transaction.type,
                    }}
                  />
                  <DeleteTraderTransaction
                    traderId={trader._id}
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
          description="Start by adding your first trader transaction"
          link={`/milk/traders/${id}/add-transaction`}
          linkText="Add Trader Transaction"
        />
      )}
    </div>
  );
}
