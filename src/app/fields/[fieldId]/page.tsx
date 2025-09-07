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
import {
  getAvailableDateRangesForField,
  getField,
  getFieldFarmers,
  getRemainingArea,
} from "@/lib/actions/field";
import { PlusIcon } from "lucide-react";
import { convertShareTypes, getDateRangeDescription } from "@/lib/utils";
import FieldSummary from "@/components/fields/field-summary";
import EditFarmerDialog from "@/components/fields/edit-farmer-dialog";
import { getFieldFarmerExpenses } from "@/lib/actions/farmer";
import DateRangeSelector from "@/components/shared/date-range-selector";
import { CardDescription } from "@/components/ui/card";
import CustomSearch from "@/components/shared/search";
import PrintFieldSummary from "@/components/fields/print-field-summary";

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
  const { startDate, endDate, year, month } = await searchParams;

  const field = await getField(fieldId);
  const farmers = await getFieldFarmers(fieldId);

  const { remainingArea } = await getRemainingArea(fieldId);
  const { months, years } = await getAvailableDateRangesForField(fieldId);
  const serializableFarmers = farmers.map((farmer) => ({
    _id: farmer._id.toString(),
    name: farmer.name,
  }));
  // Get date range description for display
  const dateRangeDescription = getDateRangeDescription({
    selectedYear: year || "all",
    selectedMonth: month,
    startDate,
    endDate,
  });

  const farmersWithFinancials = await Promise.all(
    farmers.map(async (farmer) => {
      const result = await getFieldFarmerExpenses(farmer._id.toString(), {
        startDate,
        endDate,
        year,
        month,
      });

      const farmerIncome = result.summary?.farmerIncome || 0;
      const ownerIncome = result.summary?.ownerIncome || 0;
      const farmerExpenses = result.summary?.totalFarmerExpenses || 0;
      const ownerExpenses = result.summary?.totalOwnerExpenses || 0;

      const totalIncome = result.summary?.totalIncome || 0;
      const totalExpenses = farmerExpenses + ownerExpenses;

      // balances
      const totalBalance = totalIncome - totalExpenses;
      const farmerBalance = farmerIncome - farmerExpenses;
      const ownerBalance = ownerIncome - ownerExpenses;

      return {
        ...farmer,
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalBalance,

        farmerIncome,
        ownerIncome,
        farmerExpenses,
        ownerExpenses,
        farmerBalance,
        ownerBalance,
      };
    })
  );

  // Grand totals
  const totals = farmersWithFinancials.reduce(
    (acc, farmer) => {
      acc.totalFarmerIncome += farmer.farmerIncome;
      acc.totalOwnerIncome += farmer.ownerIncome;
      acc.totalFarmerExpenses += farmer.farmerExpenses;
      acc.totalOwnerExpenses += farmer.ownerExpenses;

      acc.totalIncome += farmer.income;
      acc.totalExpenses += farmer.expenses;
      acc.balance += farmer.balance;

      acc.totalFarmerBalance += farmer.farmerBalance;
      acc.totalOwnerBalance += farmer.ownerBalance;

      return acc;
    },
    {
      totalFarmerIncome: 0,
      totalOwnerIncome: 0,
      totalFarmerExpenses: 0,
      totalOwnerExpenses: 0,
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      totalFarmerBalance: 0,
      totalOwnerBalance: 0,
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{field.name}</h1>
          <p className="text-muted-foreground">
            Total Area: {field.totalArea} acres
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PrintFieldSummary
            field={field}
            farmers={farmersWithFinancials}
            summary={totals}
          />
          <BackLink href="/fields" linkText="Back to Fields" />
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <div className="flex gap-4 items-center justify-between mb-2">
          <CardDescription>{dateRangeDescription}</CardDescription>
        </div>
        <DateRangeSelector
          availableYears={years || []}
          availableMonths={months || []}
        />
      </div>

      {/* Field Summary Section */}
      {farmers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Field Summary</h2>
          <FieldSummary summary={totals} />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <h2 className="text-xl font-semibold">Farmers</h2>
            <CustomSearch
              data={serializableFarmers}
              baseUrl={`/fields/${field._id}/farmers`}
              placeholder="Search Farmers..."
            />
          </div>
          <div className="flex items-center space-x-4">
            <Link href={`/fields/${field._id}/add-farmer`}>
              <Button>
                <PlusIcon className="size-4" /> Add Farmer
              </Button>
            </Link>
          </div>
        </div>

        {farmersWithFinancials.length > 0 ? (
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
              {farmersWithFinancials.map((farmer) => (
                <TableRow key={farmer._id}>
                  <TableCell>{farmer.name}</TableCell>
                  <TableCell>
                    {convertShareTypes(farmer.shareType, true)}
                  </TableCell>
                  <TableCell>{farmer.allocatedArea} acres</TableCell>
                  <TableCell className=" bg-red-500/10 font-medium">
                    Rs. {(farmer.expenses || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className=" bg-green-500/10 font-medium">
                    Rs. {(farmer.income || 0).toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`font-medium ${
                      (farmer.balance || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Rs. {(farmer.balance || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <div className="flex justify-end gap-2">
                      <EditFarmerDialog
                        fieldId={field._id}
                        farmerId={farmer._id}
                        farmerName={farmer.name}
                        shareType={farmer.shareType}
                        allocatedArea={farmer.allocatedArea}
                        maxArea={remainingArea}
                      />
                      <Link href={`/fields/${field._id}/farmers/${farmer._id}`}>
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
