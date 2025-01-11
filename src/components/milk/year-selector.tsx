"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface YearSelectorProps {
  years: number[];
}

export default function YearSelector({ years }: YearSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    if (year === "all") {
      params.delete("year");
      params.delete("month");
    } else {
      params.set("year", year);
      params.delete("month");
    }
    router.push(`${pathname}?${params.toString()}`);
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
