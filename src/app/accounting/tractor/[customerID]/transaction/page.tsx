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
import { getCustomerSummary } from "@/lib/actions/customer";
import EmptyTractorData from "@/components/shared/empty-tractor-data";

export default async function CustomerTransactionsPage({
  params,
}: {
  params: Promise<{ customerID: string }>;
}) {
  const customerId = (await params).customerID;
  const { transactions, customer } = await getCustomerSummary(customerId);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {customer?.name.charAt(0).toUpperCase() + customer?.name.slice(1) ||
            "Customer"}
        </h3>
        <div className="mt-4 space-x-4">
          <Link
            href={`/accounting/tractor/${customerId}/transaction/add-transaction`}
          >
            <Button>Add Transaction</Button>
          </Link>
        </div>
      </div>
      {transactions.filter((transaction) => transaction.type !== "DEBIT")
        .length === 0 ? (
        <EmptyTractorData title="transactions" />
      ) : (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions
              .filter((transaction) => transaction.type !== "DEBIT")
              .map((transaction) => (
                <TableRow key={transaction._id.toString()}>
                  <TableCell>
                    Rs {transaction.amount.toLocaleString()}
                  </TableCell>

                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
