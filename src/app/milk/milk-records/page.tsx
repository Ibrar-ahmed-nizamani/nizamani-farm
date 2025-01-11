import { getMilkData, getMilkYearsAndMonths } from "@/lib/actions/milk";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import EmptyState from "@/components/shared/empty-state";
import YearSelector from "@/components/milk/year-selector";
import MonthSelector from "@/components/milk/month-selector";
import MilkTable from "@/components/milk/milk-table";
import BackLink from "@/components/ui/back-link";

interface MilkPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function MilkPage({ searchParams }: MilkPageProps) {
  const year = (await searchParams).year;
  const month = (await searchParams).month;

  const yearsAndMonths = await getMilkYearsAndMonths();
  const milkData = await getMilkData(year, month);

  const years = yearsAndMonths.map((yearsAndMonths) => yearsAndMonths.year);
  const availableMonths = year
    ? yearsAndMonths.find((ym) => ym.year.toString() === year)?.months || []
    : [];
  // Calculate totals
  const totalAmMilk = milkData.reduce((sum, record) => sum + record.amMilk, 0);
  const totalPmMilk = milkData.reduce((sum, record) => sum + record.pmMilk, 0);
  const totalMilk = totalAmMilk + totalPmMilk;

  return (
    <div className=" space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Milk Records</h1>
        <BackLink href="/milk" linkText="Back to Milk Page" />
      </div>

      <div className="rounded-md border p-4 bg-muted/10">
        <h3 className="font-semibold mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total AM Milk</div>
            <div className="text-lg font-medium">{totalAmMilk.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total PM Milk</div>
            <div className="text-lg font-medium">{totalPmMilk.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Milk</div>
            <div className="text-lg font-medium">{totalMilk.toFixed(1)} </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <YearSelector years={years} />
          {year && year !== "all" && (
            <MonthSelector availableMonths={availableMonths} />
          )}
        </div>
        <Link href="/milk/milk-records/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Milk
          </Button>
        </Link>
      </div>

      {milkData.length === 0 ? (
        <EmptyState
          title="No milk records found"
          description="Start by adding your first milk record"
          link="/milk/add"
          linkText="Add Milk Record"
        />
      ) : (
        <MilkTable milkData={milkData} />
      )}
    </div>
  );
}
