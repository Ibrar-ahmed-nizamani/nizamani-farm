// app/milk/customers/[id]/transactions/page.tsx
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
import {
  getMilkCustomer,
  getMilkCustomerPayments,
} from "@/lib/actions/milk-customer-actions";
import BackLink from "@/components/ui/back-link";
import { formatDatePattern } from "@/lib/utils";
import { DeleteTransaction } from "@/components/milk/customer/delete-transaction";
import EmptyState from "@/components/shared/empty-state";
import { EditPayment } from "@/components/milk/customer/edit-payment";

export default async function CustomerTransactionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const customer = await getMilkCustomer(id);
  const transactions = await getMilkCustomerPayments(id);
  // transactions.map((transaction) => {
  //   console.log(typeof transaction.amount);
  // });
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{customer.name} - Payments</h1>
        <BackLink href={`/milk/customers/${id}`} linkText="Back To Customer" />
      </div>

      <div className="flex gap-2">
        <Link href={`/milk/customers/${id}/payments/add-payment`}>
          <Button>Add Payment</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount (Rs)</TableHead>
                <TableHead className="w-[80px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{formatDatePattern(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.amount.toLocaleString()}</TableCell>
                  <TableCell className="flex gap-3 items-center justify-center">
                    <EditPayment
                      customerId={id}
                      payment={{
                        _id: transaction._id,
                        amount: transaction.amount,
                        date: transaction.date.toISOString(),
                        description: transaction.description,
                      }}
                    />
                    <DeleteTransaction
                      customerId={id}
                      transactionId={transaction._id}
                      date={formatDatePattern(transaction.date)}
                      amount={transaction.amount}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No transaction records found"
            description="Start by adding your first transaction"
            link={`/milk/customers/${id}/payments/add-payment`}
            linkText="Add Payment"
          />
        )}
      </div>
    </div>
  );
}
