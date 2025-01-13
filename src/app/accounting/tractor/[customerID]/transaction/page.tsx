import Link from "next/link";
import { Button } from "@/components/ui/button";

import EmptyTractorData from "@/components/shared/empty-tractor-data";
import { ArrowLeftIcon } from "lucide-react";
import TransactionReport from "@/components/transaction/transaction-report";
import { getCustomerName } from "@/lib/actions/customer";

import { getCustomerTransactions } from "@/lib/actions/transaction";
import YearSelector from "@/components/tractor/year-selector";
import TransactionsTable from "@/components/transaction/transactions-table";
import { getTransactionAvailableYears } from "@/lib/actions/transaction";

export default async function CustomerTransactionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerID: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const customerId = (await params).customerID;
  const selectedYear = (await searchParams).year || "all";

  const [transactions, availableYears, customerDetails] = await Promise.all([
    getCustomerTransactions(customerId, selectedYear),
    getTransactionAvailableYears(customerId),
    getCustomerName(customerId),
  ]);

  const customer = customerDetails;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {customer?.name.charAt(0).toUpperCase() + customer?.name.slice(1) ||
            "Customer"}
        </h3>
        <Link href={`/accounting/tractor/${customerId}`}>
          <Button variant="link">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Customer
          </Button>
        </Link>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customer Payments</h3>
        <div className="flex items-center gap-4">
          <YearSelector availableYears={availableYears} />
          <TransactionReport
            customerName={customer?.name}
            customerId={customerId}
            year={selectedYear}
          />
        </div>
      </div>
      <div className="mt-4 space-x-4">
        <Link
          href={`/accounting/tractor/${customerId}/transaction/add-transaction`}
        >
          <Button>Add Transaction</Button>
        </Link>
      </div>
      {transactions.filter((transaction) => transaction.type === "CREDIT")
        .length === 0 ? (
        <EmptyTractorData title="transactions" />
      ) : (
        <TransactionsTable
          transactions={transactions}
          customerId={customerId}
        />
      )}
    </section>
  );
}
