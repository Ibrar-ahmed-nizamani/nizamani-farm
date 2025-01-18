// app/milk/summary/page.tsx

import MilkSummaryPage from "@/components/milk/summary/summary";

import {
  getMilkSummaryData,
  getMilkSummaryYearsAndMonths,
} from "@/lib/actions/milk-summary";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { year, month } = await searchParams;
  const data = await getMilkSummaryData(year, month);

  const yearsAndMonths = await getMilkSummaryYearsAndMonths();

  const years = yearsAndMonths.map((yearsAndMonths) => yearsAndMonths.year);
  const availableMonths = year
    ? yearsAndMonths.find((ym) => ym.year.toString() === year)?.months || []
    : [];

  return (
    <MilkSummaryPage
      expenses={data.expenses}
      customerRecords={data.customerRecords}
      // workerCredits={data.workerCredits}
      years={years}
      months={availableMonths}
    />
  );
}
