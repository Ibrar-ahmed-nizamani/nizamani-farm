"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseTypeSelectorProps {
  expenseTypes: { _id: string; name: string }[];
}

export default function ExpenseTypeSelector({
  expenseTypes,
}: ExpenseTypeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentExpenseType = searchParams.get("expenseType") || "all";

  const handleExpenseTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete("expenseType");
    } else {
      params.set("expenseType", value);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentExpenseType} onValueChange={handleExpenseTypeChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Expense Types" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Expense Types</SelectItem>
        {expenseTypes.map((type) => (
          <SelectItem key={type._id} value={type.name}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
