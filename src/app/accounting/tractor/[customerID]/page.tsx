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
import { CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { CustomerTractorWork } from "@/lib/type-definitions";
import { getCustomerSummary } from "@/lib/actions/customer";

export default async function CustomerSummary({
  params,
}: {
  params: Promise<{ customerID: string }>;
}) {
  const customerId = (await params).customerID;
  const customerSummary = await getCustomerSummary(customerId);
  const works = customerSummary.works;
  console.log(works);

  const customerName =
    customerSummary?.customer?.name?.charAt(0).toUpperCase() +
    customerSummary?.customer?.name?.slice(1);

  const summary = customerSummary.summary;
  // Calculate total amount paid from transactions
  const amountPaid = summary.totalPaid;

  // Calculate total debit from works
  const totalDebit = summary.totalDebit;

  // Calculate remaining amount due
  const amountDue = summary.balance;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{customerName}</h3>
        <div className="mt-4 space-x-4">
          <Link
            href={`/accounting/tractor/${customerId}/transaction/add-transaction`}
          >
            <Button>Add Transaction</Button>
          </Link>
          <Link href={`/accounting/tractor/${customerId}/transaction`}>
            <Button variant="outline">Show Transactions</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Badge variant="destructive" className="p-2 text-base font-normal">
          Total Debit: Rs {totalDebit}
        </Badge>
        <Badge className="p-2 text-base font-normal">
          Amount Paid: Rs {amountPaid}
        </Badge>
        <Badge variant="outline" className="p-2 text-base font-normal">
          Due: Rs {amountDue}
        </Badge>
      </div>

      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>Tractor</TableHead>
            <TableHead>Equipment & Hours</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {works.map((work, index) => (
            <TableRow key={index}>
              <TableCell>
                <div>{work.tractor?.tractorName || "N/A"}</div>
                <CardDescription>
                  {work.tractor?.tractorModel || "N/A"}
                </CardDescription>
              </TableCell>
              <TableCell>
                {work.equipments?.map(
                  (equipment: { name: string; hours: number }, idx: number) => (
                    <div key={idx} className="flex gap-8 mb-2">
                      <span className="w-16">{equipment.name}</span> -
                      <span>{equipment.hours} hours</span>
                    </div>
                  )
                ) || "No equipment data"}
              </TableCell>
              <TableCell>Rs {work.totalAmount}</TableCell>
              <TableCell>
                {new Date(work.date).toLocaleDateString("en-GB")}
              </TableCell>
              <TableCell>
                <Button asChild variant="outline">
                  <Link
                    href={`/accounting/tractor/${customerId}/work/${work.id}`}
                  >
                    View Detail
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
