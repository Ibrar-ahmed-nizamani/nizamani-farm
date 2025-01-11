// app/milk/summary/page.tsx

import MilkSummaryPage from "@/components/milk/summary/summary";

import { getMilkSummaryData } from "@/lib/actions/milk-summary";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { year, month } = await searchParams;
  const data = await getMilkSummaryData(year, month);
  return <MilkSummaryPage {...data} />;
}
