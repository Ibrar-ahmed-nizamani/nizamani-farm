import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getAllCustomers } from "@/lib/actions/customer";
import EmptyTractorData from "@/components/shared/empty-tractor-data";

export default async function TractorCustomerTable() {
  const customers = await getAllCustomers();
  // console.log(customers);
  const totalPayment = customers.reduce(
    (sum, customer) => sum + (customer.totalPaid || 0),
    0
  );
  const totalDebit = customers.reduce(
    (sum, customer) => sum + (customer.totalDebit || 0),
    0
  );
  const totalRemaining = totalDebit - totalPayment;
  // const extraExpenses = 500; // Mock value for extra expenses

  return (
    <div className="space-y-8">
      <Button variant="outline">
        <Link href="/">Show Extra Expenses List</Link>
      </Button>
      <div className="flex flex-wrap gap-4">
        <Badge className="p-2 text-base font-normal">
          Total Payment: Rs {totalPayment}
        </Badge>
        <Badge variant="destructive" className="p-2 text-base font-normal">
          Total Debit: Rs {totalDebit}
        </Badge>
        <Badge variant="outline" className="p-2 text-base font-normal">
          Total Remaining: Rs {totalRemaining}
        </Badge>
        {/* <Badge variant="outline" className="p-2 text-base font-normal">
          Other Expenses: Rs {extraExpenses}
        </Badge> */}
      </div>
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
              <TableHead>Remaining</TableHead>
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
                  Rs {customer.totalDebit - customer.totalPaid}
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
