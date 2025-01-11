// app/milk/customers/[id]/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddCustomerMilkForm from "@/components/milk/customer/add-customer-milk-form";
import {
  getMilkCustomerDates,
  getMilkCustomerSummary,
} from "@/lib/actions/milk-customer-actions";
import { DeleteMilkRecord } from "@/components/milk/customer/delete-customer-milk";
import CompleteCustomerReport from "@/components/milk/customer/complete-milk-customer-report";
import {
  MonthSelector,
  YearSelector,
} from "@/components/milk/customer/selectors";

export default async function CustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const id = (await params).id;
  const { year, month } = await searchParams;

  const { customer, milkRecords, summary } = await getMilkCustomerSummary(
    id,
    year,
    month
  );

  const { milkRecords: yearsAndMonths } = await getMilkCustomerDates(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <div className="flex gap-2">
          <CompleteCustomerReport
            customerDetails={{
              customerName: customer.name,
              totalDebit: summary.totalDebit,
              totalPaid: summary.totalPaid,
              balance: summary.balance,
            }}
            customerId={id}
            year={year || "all"}
            month={month}
          />
          <Link href={`/milk/customers/${id}/transactions`}>
            <Button variant="outline">View Transactions</Button>
          </Link>
          <Link href={`/milk/customers/${id}/add-payment`}>
            <Button>Add Payment</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <YearSelector records={yearsAndMonths} />
        <MonthSelector records={yearsAndMonths} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-500">Total Debit</h3>
          <p className="text-2xl font-bold">
            Rs {summary.totalDebit.toLocaleString()}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-500">Total Paid</h3>
          <p className="text-2xl font-bold">
            Rs {summary.totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-500">Balance</h3>
          <p className="text-2xl font-bold">
            Rs {summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      <AddCustomerMilkForm
        customerId={id}
        defaultQuantity={customer.defaultQuantity}
        defaultPrice={customer.defaultPrice}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Quantity (L)</TableHead>
              <TableHead>Price (Rs)</TableHead>
              <TableHead>Amount (Rs)</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milkRecords.map((record) => (
              <TableRow key={record._id}>
                <TableCell>
                  {format(new Date(record.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{record.quantity}</TableCell>
                <TableCell>{record.price}</TableCell>
                <TableCell>{record.amount.toLocaleString()}</TableCell>

                <TableCell>
                  <DeleteMilkRecord
                    customerId={id}
                    recordId={record._id}
                    date={format(new Date(record.date), "dd/MM/yyyy")}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
