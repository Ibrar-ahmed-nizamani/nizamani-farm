// app/milk/summary/page.tsx
import MilkSummaryPage from "@/components/milk/summary/summary";
import { getMilkSummaryData } from "@/lib/actions/milk-summary";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const { year, month, startDate, endDate } = await searchParams;
  // Fetch summary data with all possible filter options
  const data = await getMilkSummaryData({
    year,
    month,
    startDate,
    endDate,
  });

  return (
    <MilkSummaryPage
      expenses={data.expenses}
      customerRecords={data.customerRecords}
      customerDebits={data.customerDebits}
      years={data.years}
      months={data.months}
      startDate={startDate}
      endDate={endDate}
      selectedMonth={month}
      selectedYear={year}
    />
  );
}
