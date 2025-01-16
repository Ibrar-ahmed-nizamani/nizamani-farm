// app/milk/customers/page.tsx
import AddCustomerForm from "@/components/milk/customer/add-customer";
import EmptyState from "@/components/shared/empty-state";
import SummaryCards from "@/components/shared/summary-cards";
import BackLink from "@/components/ui/back-link";
import { getMilkCustomers } from "@/lib/actions/milk-customer-actions";
import Link from "next/link";

export default async function MilkCustomersPage() {
  const customers = await getMilkCustomers();

  const totalDebit = customers.reduce(
    (sum, customer) => sum + customer.totalDebit,
    0
  );
  const totalPaid = customers.reduce(
    (sum, customer) => sum + customer.totalPaid,
    0
  );
  const totalBalance = totalDebit - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Milk Customers</h1>
        <BackLink href="/milk" linkText="Back to Milk Page" />
      </div>
      {customers.length > 0 ? (
        <SummaryCards
          cards={[
            {
              label: "Total Debit",
              value: totalDebit,
              type: "expense",
            },
            {
              label: "Total Paid",
              value: totalPaid,
              type: "income",
            },
            {
              label: "Balance",
              value: totalBalance,
              type: "due",
            },
          ]}
        />
      ) : null}

      <AddCustomerForm />
      {customers.length > 0 ? (
        <div className="border rounded-lg">
          <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
            <div>Name</div>
            <div>Debit</div>
            <div>Paid</div>
            <div>Balance</div>
          </div>
          {customers.map((customer) => (
            <Link
              key={customer._id}
              href={`/milk/customers/${customer._id}`}
              className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 border-b last:border-0"
            >
              <div>{customer.name}</div>
              <div>Rs {customer.totalDebit.toLocaleString()}</div>
              <div>Rs {customer.totalPaid.toLocaleString()}</div>
              <div>
                Rs {(customer.totalDebit - customer.totalPaid).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No customer found"
          description="Start by adding your first customer"
        />
      )}
    </div>
  );
}
