"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { monthNumberToName } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export default function MonthSelector({
  availableMonths,
}: {
  availableMonths: number[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams);
    if (month === "all") {
      params.delete("month");
    } else {
      params.set("month", month);
    }
    router.push(`/milk/expenses?${params.toString()}`);
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
        {availableMonths.map((monthNum) => (
          <SelectItem key={monthNum} value={monthNum.toString()}>
            {monthNumberToName(monthNum)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
