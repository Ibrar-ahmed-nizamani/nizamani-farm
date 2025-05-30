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
import {
  getCustomerSummary,
  getCustomerAvailableYears,
  getCustomerAvailableMonths,
} from "@/lib/actions/customer";
import { ArrowLeftIcon, Edit2 } from "lucide-react";
import CustomerCompleteReport from "@/components/accounting/customer/customer-complete-report";
import SummaryCards from "@/components/shared/summary-cards";
import BackButton from "@/components/shared/back-button";
import CustomerWorksReport from "@/components/accounting/customer/customer-works-report";
import { capitalizeFirstLetter, formatDatePattern } from "@/lib/utils";
import DateRangeSelector from "@/components/shared/date-range-selector";

export default async function TractorCustomerSummary({
  params,
  searchParams,
}: {
  params: Promise<{ customerID: string }>;
  searchParams: Promise<{
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const customerId = (await params).customerID;
  const selectedYear = (await searchParams).year || "all";
  const selectedMonth = (await searchParams).month || "all";
  const startDate = (await searchParams).startDate;
  const endDate = (await searchParams).endDate;

  // Fetch data in parallel
  const [customerSummary, availableYears, availableMonths] = await Promise.all([
    getCustomerSummary(
      customerId,
      selectedYear,
      selectedMonth,
      startDate,
      endDate
    ),
    getCustomerAvailableYears(customerId),
    getCustomerAvailableMonths(customerId),
  ]);
  const customerName =
    customerSummary?.customer?.name?.charAt(0).toUpperCase() +
    customerSummary?.customer?.name?.slice(1);
  const summary = customerSummary.summary;

  return (
    <>
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{customerName}</h3>
          <div className="flex items-center space-x-4">
            <BackButton />
            <Link href={`/accounting/tractor`}>
              <Button variant="link">
                <ArrowLeftIcon className="w-4 h-4" /> Back to Customers
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-4">
              <CustomerCompleteReport
                customerId={customerId}
                customerName={customerName}
                year={selectedYear}
                month={selectedMonth}
                startDate={startDate}
                endDate={endDate}
              />
              <Link href={`/accounting/tractor/${customerId}/transaction`}>
                <Button variant="outline">Show Transactions</Button>
              </Link>
              <Link
                href={`/accounting/tractor/${customerId}/transaction/add-transaction`}
              >
                <Button>Add Transaction</Button>
              </Link>
            </div>
          </div>
        </div>
        <DateRangeSelector
          availableYears={availableYears}
          availableMonths={availableMonths}
        />

        <SummaryCards
          cards={[
            {
              label: "Total Debit",
              value: summary.totalDebit,
              type: "expense",
            },
            {
              label: "Amount Paid",
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
        <div className="flex justify-end">
          <CustomerWorksReport
            customerName={customerName}
            customerId={customerId}
            year={selectedYear}
            month={selectedMonth}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        <Table className="border ">
          <TableHeader>
            <TableRow>
              <TableHead>Tractor</TableHead>
              <TableHead>Equipment & Hours</TableHead>
              <TableHead>Work Detail</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[60px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerSummary.works.map((work, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div>{work.tractor?.tractorName || "N/A"}</div>
                  <CardDescription>
                    {work.tractor?.tractorModel || "N/A"}
                  </CardDescription>
                </TableCell>
                <TableCell>
                  {work.equipments?.map(
                    (
                      equipment: { name: string; hours: number },
                      idx: number
                    ) => (
                      <div key={idx} className="flex gap-8 mb-2">
                        <span className="w-16">
                          {capitalizeFirstLetter(equipment.name)}
                        </span>{" "}
                        -<span>{equipment.hours} hours</span>
                      </div>
                    )
                  ) || "No equipment data"}
                </TableCell>
                <TableCell>{work.detail ? work.detail : "N/A"}</TableCell>
                <TableCell>Rs {work.totalAmount}</TableCell>
                <TableCell>{formatDatePattern(work.date)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline">
                    <Link
                      href={`/tractor/${work.tractorId}/edit-work/${work._id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
