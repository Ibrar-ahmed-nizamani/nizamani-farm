// components/milk/customer/selectors.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const monthNames = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
} as const;

interface MilkRecord {
  date: string;
}

export function WorkerYearSelector({ records }: { records: MilkRecord[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const years = Array.from(
    new Set(records.map((record) => new Date(record.date).getFullYear()))
  ).sort((a, b) => b - a);

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    if (year === "all") {
      params.delete("year");
      params.delete("month");
    } else {
      params.set("year", year);
      params.delete("month");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={searchParams.get("year") || "all"}
      onValueChange={handleYearChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Year" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Years</SelectItem>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function WorkerMonthSelector({ records }: { records: MilkRecord[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedYear = searchParams.get("year");

  const months = Array.from(
    new Set(
      records
        .filter((record) =>
          selectedYear
            ? new Date(record.date).getFullYear().toString() === selectedYear
            : true
        )
        .map((record) => new Date(record.date).getMonth() + 1)
    )
  ).sort((a, b) => a - b);

  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams);
    if (month === "all") {
      params.delete("month");
    } else {
      params.set("month", month);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!selectedYear) return null;

  return (
    <Select
      defaultValue={searchParams.get("month") || "all"}
      onValueChange={handleMonthChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Month" />
      </SelectTrigger>
      <SelectContent className="max-h-32">
        <SelectItem value="all">All Months</SelectItem>
        {months.map((month) => (
          <SelectItem key={month} value={month.toString()}>
            {monthNames[month as keyof typeof monthNames]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
