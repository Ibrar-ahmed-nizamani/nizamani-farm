// app/milk/customers/[id]/page.tsx
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
import SummaryCards from "@/components/shared/summary-cards";
import { formatDatePattern } from "@/lib/utils";
import BackLink from "@/components/ui/back-link";
import EmptyState from "@/components/shared/empty-state";
import { EditMilkRecord } from "@/components/milk/customer/edit-customer-milk-record";

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
        <BackLink href="/milk/customers" linkText="Back to Customers" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4 items-center">
          <YearSelector records={yearsAndMonths} />
          <MonthSelector records={yearsAndMonths} />
        </div>
        <div className="flex gap-4">
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
          <Link href={`/milk/customers/${id}/debits`}>
            <Button variant="destructive">Debits</Button>
          </Link>
          <Link href={`/milk/customers/${id}/payments`}>
            <Button variant="default">Payments</Button>
          </Link>

          {/* <Link href={`/milk/customers/${id}/payments/add-payment`}>
            <Button>Add Payment</Button>
          </Link> */}
        </div>
      </div>

      <SummaryCards
        cards={[
          {
            label: "Total Debit",
            value: summary.totalDebit,
            type: "expense",
          },
          {
            label: "Total Paid",
            value: summary.totalPaid,
            type: "income",
          },
          {
            label: "Balance",
            value: summary.balance,
            type: "due",
          },
        ]}
      />

      <AddCustomerMilkForm
        customerId={id}
        defaultQuantity={customer.defaultQuantity}
        defaultPrice={customer.defaultPrice}
      />
      {milkRecords.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Quantity (L)</TableHead>
                <TableHead>Price (Rs)</TableHead>
                <TableHead>Amount (Rs)</TableHead>
                <TableHead className="w-[80px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milkRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{formatDatePattern(record.date)}</TableCell>
                  <TableCell>{record.quantity}</TableCell>
                  <TableCell>{record.price}</TableCell>
                  <TableCell>{record.amount.toFixed(0)}</TableCell>

                  <TableCell className="flex gap-3 items-center justify-center">
                    <EditMilkRecord
                      customerId={id}
                      record={{
                        _id: record._id,
                        date: record.date.toISOString(),
                        price: record.price,
                        quantity: record.quantity,
                      }}
                    />
                    <DeleteMilkRecord
                      customerId={id}
                      recordId={record._id}
                      date={formatDatePattern(record.date)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="No milk record found"
          description="Start by adding your first milk record"
        />
      )}
    </div>
  );
}
