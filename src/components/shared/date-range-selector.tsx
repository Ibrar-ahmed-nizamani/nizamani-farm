"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangeSelectorProps {
  availableYears: number[];
  availableMonths?: { year: number; month: number; label: string }[];
}

// Add this helper function to ensure correct date formatting
const formatDateForParam = (date: Date): string => {
  // Format date as YYYY-MM-DD in local timezone to avoid off-by-one errors
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function DateRangeSelector({
  availableYears,
  availableMonths = [],
}: DateRangeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentYear = searchParams.get("year") || "all";
  const currentMonth = searchParams.get("month") || "all";

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined
  );

  // Initial month to show in calendars
  const [startDateDefaultMonth, setStartDateDefaultMonth] = useState<
    Date | undefined
  >(startDate || new Date());
  const [endDateDefaultMonth, setEndDateDefaultMonth] = useState<
    Date | undefined
  >(endDate || new Date());

  // Filter months by selected year
  const filteredMonths =
    currentYear !== "all"
      ? availableMonths.filter((m) => m.year === parseInt(currentYear))
      : availableMonths;

  // Update URL with selected filters
  const updateFilters = (params: URLSearchParams) => {
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);

    // Reset month when year changes
    params.delete("month");

    // Handle year param
    if (year === "all") {
      params.delete("year");
    } else {
      params.set("year", year);
    }

    // Reset date range when changing year
    params.delete("startDate");
    params.delete("endDate");
    setStartDate(undefined);
    setEndDate(undefined);

    updateFilters(params);
  };

  const handleMonthChange = (monthValue: string) => {
    const params = new URLSearchParams(searchParams);

    if (monthValue === "all") {
      params.delete("month");
    } else {
      params.set("month", monthValue);
    }

    // Reset date range when changing month
    params.delete("startDate");
    params.delete("endDate");
    setStartDate(undefined);
    setEndDate(undefined);

    updateFilters(params);
  };

  const clearDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStartDateDefaultMonth(new Date());
    setEndDateDefaultMonth(new Date());

    const params = new URLSearchParams(searchParams);
    params.delete("startDate");
    params.delete("endDate");

    updateFilters(params);
  };

  // Handle start date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setStartDateOpen(false); // Close the popover

    if (date) {
      setStartDateDefaultMonth(date);

      // If selected start date is after current end date, clear end date
      if (endDate && date > endDate) {
        setEndDate(undefined);
        setEndDateDefaultMonth(date);
      } else if (!endDate) {
        // Set end date default month to the selected start date month
        setEndDateDefaultMonth(date);
      } else {
        // If end date is already present, apply the filter immediately
        setTimeout(() => {
          const params = new URLSearchParams(searchParams);
          params.delete("year");
          params.delete("month");

          // Fix for timezone issues - use correct date formatting
          const formattedStartDate = formatDateForParam(date);
          const formattedEndDate = formatDateForParam(endDate);

          params.set("startDate", formattedStartDate);
          params.set("endDate", formattedEndDate);
          updateFilters(params);
        }, 100);
      }
    }
  };

  // Handle end date selection
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setEndDateOpen(false); // Close the popover

    if (date && startDate) {
      setEndDateDefaultMonth(date);

      // Auto-apply range when end date is selected
      setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("year");
        params.delete("month");

        // Fix for timezone issues - use correct date formatting
        const formattedStartDate = formatDateForParam(startDate);
        const formattedEndDate = formatDateForParam(date);

        params.set("startDate", formattedStartDate);
        params.set("endDate", formattedEndDate);
        updateFilters(params);
      }, 100);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div>
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
      </div>

      {currentYear !== "all" && filteredMonths.length > 0 && (
        <div>
          <Select value={currentMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {filteredMonths.map((monthObj) => (
                <SelectItem
                  key={`${monthObj.year}-${monthObj.month}`}
                  value={monthObj.month.toString()}
                >
                  {monthObj.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[210px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartDateSelect}
              defaultMonth={startDateDefaultMonth}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[210px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={handleEndDateSelect}
              defaultMonth={endDateDefaultMonth}
              initialFocus
              disabled={(date) => (startDate ? date < startDate : false)}
            />
          </PopoverContent>
        </Popover>

        {(startDate || endDate) && (
          <Button variant="outline" onClick={clearDateRange}>
            Clear Range
          </Button>
        )}
      </div>
    </div>
  );
}
