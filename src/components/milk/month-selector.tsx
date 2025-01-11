"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { monthNumberToName } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function MonthSelector({
  availableMonths,
}: {
  availableMonths: number[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams);
    if (month === "all") {
      params.delete("month");
    } else {
      params.set("month", month);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={searchParams.get("month") || "all"}
      onValueChange={handleMonthChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Month" />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        <SelectItem value="all">All Months</SelectItem>
        {availableMonths.map((month) => (
          <SelectItem key={month} value={month.toString()}>
            {monthNumberToName(month)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
