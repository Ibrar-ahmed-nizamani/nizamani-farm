"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseYearSelectorProps {
  availableYears: number[];
}

export default function ExpenseYearSelector({
  availableYears,
}: ExpenseYearSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentYear = searchParams.get("year") || "all";

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    if (year === "all") {
      params.delete("year");
    } else {
      params.set("year", year);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentYear} onValueChange={handleYearChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Year" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Years</SelectItem>
        {availableYears.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
