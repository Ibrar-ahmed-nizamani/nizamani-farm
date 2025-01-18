// app/milk/customers/[id]/debits/page.tsx
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
  getCustomerDebits,
  getMilkCustomer,
} from "@/lib/actions/milk-customer-actions";
import BackLink from "@/components/ui/back-link";
import { formatDatePattern } from "@/lib/utils";
import { DeleteTransaction } from "@/components/milk/customer/delete-transaction";
import EmptyState from "@/components/shared/empty-state";

export default async function CustomerDebitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const customer = await getMilkCustomer(id);
  const debits = await getCustomerDebits(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {customer.name} - Additional Debits
        </h1>
        <BackLink href={`/milk/customers/${id}`} linkText="Back To Customer" />
      </div>

      <div className="flex gap-2">
        <Link href={`/milk/customers/${id}/debits/add-debit`}>
          <Button>Add Debit</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        {debits.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount (Rs)</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debits.map((debit) => (
                <TableRow key={debit._id}>
                  <TableCell>{formatDatePattern(debit.date)}</TableCell>
                  <TableCell>{debit.description}</TableCell>
                  <TableCell>{debit.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <DeleteTransaction
                      customerId={id}
                      transactionId={debit._id}
                      date={formatDatePattern(debit.date)}
                      amount={debit.amount}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No debit records found"
            description="Start by adding your first debit record"
            link={`/milk/customers/${id}/debits/add-debit`}
            linkText="Add Debit"
          />
        )}
      </div>
    </div>
  );
}
