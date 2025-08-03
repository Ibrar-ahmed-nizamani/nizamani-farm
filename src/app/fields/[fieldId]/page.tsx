// app/fields/[fieldId]/page.tsx

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import EmptyState from "@/components/shared/empty-state";
import BackLink from "@/components/ui/back-link";
import { PlusIcon } from "lucide-react";
import { getDateRangeDescription } from "@/lib/utils";
import FieldSummary from "@/components/fields/field-summary";
import EditFarmerDialog from "@/components/fields/edit-farmer-dialog";
import DateRangeSelector from "@/components/shared/date-range-selector";
import { CardDescription } from "@/components/ui/card";
import CustomSearch from "@/components/shared/search";
import {
  getAvailableDateFiltersForField,
  getFieldDetailPageData,
} from "@/lib/actions/NewField";

interface SearchParams {
  startDate?: string;
  endDate?: string;
  year?: string;
  month?: string;
}

export default async function FieldPage({
  params,
  searchParams,
}: {
  params: Promise<{ fieldId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const fieldId = (await params).fieldId;
  // const { startDate, endDate, year, month } = await searchParams;
  const filterOptions = await searchParams;
  const { endDate, month, startDate, year } = filterOptions;
  const [pageData, dateFilters] = await Promise.all([
    getFieldDetailPageData(fieldId, filterOptions),
    getAvailableDateFiltersForField(fieldId),
  ]);

  if (!pageData) {
    return (
      <EmptyState
        title="Field not found"
        description="This field may have been deleted."
      />
    );
  }

  const { name, totalArea, summary, farmers } = pageData;
  const { availableYears, availableMonths } = dateFilters;

  // Get date range description for display
  const dateRangeDescription = getDateRangeDescription({
    selectedYear: year || "all",
    selectedMonth: month,
    startDate,
    endDate,
  });
  console.log(farmers);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-muted-foreground">Total Area: {totalArea} acres</p>
        </div>
        <BackLink href="/fields" linkText="Back to Fields" />
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <div className="flex gap-4 items-center justify-between mb-2">
          <CardDescription>{dateRangeDescription}</CardDescription>
        </div>
        <DateRangeSelector
          availableYears={availableYears || []}
          availableMonths={availableMonths || []}
        />
      </div>

      {/* Field Summary Section */}
      {farmers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Field Summary</h2>
          <FieldSummary summary={summary} />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <h2 className="text-xl font-semibold">Farmers</h2>
            <CustomSearch
              data={farmers}
              baseUrl={`/fields/${fieldId}/farmers`}
              placeholder="Search Farmers..."
            />
          </div>
          <div className="flex items-center space-x-4">
            <Link href={`/fields/${fieldId}/add-farmer`}>
              <Button>
                <PlusIcon className="size-4" /> Add Farmer
              </Button>
            </Link>
          </div>
        </div>

        {farmers.length > 0 ? (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Share Type</TableHead>
                <TableHead>Allocated Area</TableHead>
                <TableHead>Total Expenses</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Net Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell>{farmer.name}</TableCell>
                  <TableCell>{farmer.share}</TableCell>
                  <TableCell>{farmer.allocatedArea} acres</TableCell>
                  <TableCell className=" bg-red-500/10 font-medium">
                    Rs. {farmer.totalExpense || 0}
                  </TableCell>
                  <TableCell className=" bg-green-500/10 font-medium">
                    Rs. {farmer.totalIncome || 0}
                  </TableCell>
                  <TableCell
                    className={`font-medium ${
                      (farmer.netBalance || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Rs. {farmer.netBalance || 0}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <div className="flex justify-end gap-2">
                      <EditFarmerDialog
                        fieldId={fieldId}
                        farmerId={farmer.id}
                        farmerName={farmer.name}
                        shareType={farmer.share}
                        allocatedArea={farmer.allocatedArea}
                        maxArea={20}
                      />
                      <Link href={`/fields/${fieldId}/farmers/${farmer.id}`}>
                        <Button variant="outline" size="sm" className="h-8">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No farmers assigned"
            description="Start by adding farmers to this field"
          />
        )}
      </div>
    </div>
  );
}
