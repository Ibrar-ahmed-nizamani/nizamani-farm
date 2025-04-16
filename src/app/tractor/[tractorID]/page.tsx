import EmptyTractorData from "@/components/shared/empty-tractor-data";
import TractorWorkTable from "@/components/tractor/work-table";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import Link from "next/link";
import {
  getFilteredWorks,
  getTractorAvailableMonths,
} from "@/lib/actions/work";
import { getTractorDetails } from "@/lib/actions/tractor";
import PrintReport from "@/components/tractor/print-report";
import CompleteReport from "@/components/tractor/complete-report";
import SummaryCards from "@/components/shared/summary-cards";
import DateRangeSelector from "@/components/shared/date-range-selector";

export default async function TractorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tractorID: string }>;
  searchParams: Promise<{
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const tractorID = (await params).tractorID;
  const selectedYear = (await searchParams).year || "all";
  const selectedMonth = (await searchParams).month || "all";
  const startDate = (await searchParams).startDate;
  const endDate = (await searchParams).endDate;

  // Get available months for the selected year
  const availableMonths = await getTractorAvailableMonths(tractorID);

  // Get filtered works based on date filters
  const { works, availableYears } = await getFilteredWorks(tractorID, {
    year: selectedYear,
    month: selectedMonth,
    startDate,
    endDate,
  });

  // Get tractor details with appropriate date filters
  const tractorDetails = await getTractorDetails(
    tractorID,
    selectedYear === "all" ? undefined : selectedYear,
    selectedMonth === "all" ? undefined : selectedMonth,
    startDate,
    endDate
  );

  return (
    <section>
      <div className="flex justify-between items-center">
        <div className="mb-3">
          <h2 className="text-xl font-semibold">
            {tractorDetails.tractorName}
          </h2>
          <CardDescription className="text-base">
            {tractorDetails.tractorModel}
          </CardDescription>
        </div>
        <div className="flex gap-4 items-center">
          <CompleteReport
            tractorDetails={tractorDetails}
            tractorId={tractorID}
            year={selectedYear}
            month={selectedMonth}
            startDate={startDate}
            endDate={endDate}
          />

          <Link href={`/tractor/${tractorID}/expenses`}>
            <Button variant="outline" size="lg">
              Show Expenses
            </Button>
          </Link>
        </div>
      </div>
      <div className="space-y-4 mb-4">
        <DateRangeSelector
          availableYears={availableYears}
          availableMonths={availableMonths}
        />

        <SummaryCards
          cards={[
            {
              label: "Total Income",
              value: tractorDetails.totalIncome,
              type: "income",
            },
            {
              label: "Total Expenses",
              value: tractorDetails.totalExpenses,
              type: "expense",
            },
            {
              label: "Net Revenue",
              value: -tractorDetails.revenue,
              type: "due",
            },
          ]}
        />
      </div>
      <h3 className="text-xl font-semibold mb-3">Tractor Works List</h3>
      <div className="flex justify-between ">
        <div className="flex gap-8">
          <Button asChild size="lg" className="mb-4">
            <Link href={`/tractor/${tractorID}/add-work`}>Add Work</Link>
          </Button>
          <Link href={`/tractor/${tractorID}/expenses/add-expense`}>
            <Button variant="destructive" size="lg">
              Add expense
            </Button>
          </Link>
        </div>
        <div>
          <PrintReport
            tractorId={tractorID}
            tractorDetails={{
              ...tractorDetails,
              year: selectedYear,
              month: selectedMonth,
              startDate: startDate,
              endDate: endDate,
            }}
          />
        </div>
      </div>
      {works.length === 0 ? (
        <EmptyTractorData title="work" />
      ) : (
        <TractorWorkTable works={works} tractorId={tractorID} />
      )}
    </section>
  );
}
