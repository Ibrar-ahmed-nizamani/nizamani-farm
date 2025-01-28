import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getAllCustomers } from "@/lib/actions/customer";
import EmptyTractorData from "@/components/shared/empty-tractor-data";
import SummaryCards from "@/components/shared/summary-cards";
import AddTractorCustomerForm from "../customer/add-customer-form";

export default async function TractorCustomerTable() {
  const customers = await getAllCustomers();

  const totalPayment = customers.reduce(
    (sum, customer) => sum + (customer.totalPaid || 0),
    0
  );
  const totalDebit = customers.reduce(
    (sum, customer) => sum + (customer.totalDebit || 0),
    0
  );
  const totalRemaining = totalDebit - totalPayment;

  return (
    <div className="space-y-8">
      <SummaryCards
        cards={[
          { label: "Total Payment", value: totalPayment, type: "income" },
          { label: "Total Debit", value: totalDebit, type: "expense" },
          { label: "Balance", value: totalRemaining, type: "due" },
        ]}
      />
      <AddTractorCustomerForm />
      {customers.length === 0 ? (
        <EmptyTractorData title="Customer" />
      ) : (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Debit</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell className="text-green-600">
                  Rs {customer.totalPaid}
                </TableCell>
                <TableCell className="text-red-600">
                  Rs {customer.totalDebit}
                </TableCell>
                <TableCell>
                  Rs {Math.abs(customer.totalDebit - customer.totalPaid)}{" "}
                  {customer.totalDebit - customer.totalPaid > 0 ? "Dr" : "Cr"}
                </TableCell>
                <TableCell>
                  <Button variant="outline" asChild>
                    <Link href={`/accounting/tractor/${customer._id}`}>
                      Show Detail
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
