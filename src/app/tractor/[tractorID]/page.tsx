import EmptyTractorData from "@/components/shared/empty-tractor-data";
import TractorWorkTable from "@/components/tractor/work-table";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { getTractorWorks } from "@/lib/actions/work";
import { getTractorDetails } from "@/lib/actions/tractor";
import { Card, CardContent } from "@/components/ui/card";
import YearSelector from "@/components/tractor/year-selector";

export default async function TractorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tractorID: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const tractorID = (await params).tractorID;
  const selectedYear = (await searchParams).year || "all";

  const { works, pagination, availableYears } = await getTractorWorks(
    tractorID,
    selectedYear
  );
  const tractorDetails = await getTractorDetails(
    tractorID,
    selectedYear === "all" ? undefined : selectedYear
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
          <YearSelector availableYears={availableYears} />
          <Link href={`/tractor/${tractorID}/expenses`}>
            <Button variant="outline" size="lg">
              Show Expenses
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className=" font-medium">Total Income</p>
            <h3 className="text-xl font-bold text-green-600">
              Rs {tractorDetails.totalIncome.toLocaleString()}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Total Expenses</p>
            <h3 className="text-xl font-bold text-red-600">
              Rs {tractorDetails.totalExpenses.toLocaleString()}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Net Revenue</p>
            <h3
              className={`text-xl font-bold ${
                tractorDetails.revenue >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Rs {tractorDetails.revenue.toLocaleString()}
            </h3>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-semibold mb-3">Tractor Works List</h3>
      <Button asChild size="lg" className="mb-4">
        <Link href={`/tractor/${tractorID}/add-work`}>Add Work</Link>
      </Button>
      {works.length === 0 ? (
        <EmptyTractorData title="work" />
      ) : (
        <TractorWorkTable
          works={works}
          pagination={pagination}
          tractorId={tractorID}
        />
      )}
    </section>
  );
}
