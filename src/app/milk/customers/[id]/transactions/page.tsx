import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  getMilkCustomer,
  getMilkCustomerTransactions,
} from "@/lib/actions/milk-customer-actions";

export default async function CustomerTransactionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const customer = await getMilkCustomer(id);
  const transactions = await getMilkCustomerTransactions(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{customer.name} - Transactions</h1>
        <div className="flex gap-2">
          <Link href={`/milk/customers/${id}`}>
            <Button variant="outline">View Records</Button>
          </Link>
          <Link href={`/milk/customers/${id}/add-payment`}>
            <Button>Add Payment</Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
          <div>Date</div>
          <div>Description</div>
          <div>Amount (Rs )</div>
        </div>
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="grid grid-cols-4 gap-4 p-4 border-b last:border-0"
          >
            <div>{format(new Date(transaction.date), "dd/MM/yyyy")}</div>
            <div>{transaction.description}</div>
            <div>{transaction.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
