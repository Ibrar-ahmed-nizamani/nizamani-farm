// components/milk/summary/date-selector.tsx
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"; // Import the calendar component
import { Button } from "@/components/ui/button"; // Import the button component
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Import popover for the calendar
import { format } from "date-fns"; // For formatting the selected date

interface DateSelectorProps {
  years: number[];
  months?: number[];
  selectedYear?: string;
  selectedMonth?: string;
  selectedDate?: Date; // Add selectedDate prop
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onDateChange: (date: Date | undefined) => void; // Add onDateChange prop
}

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

const DateSelector = ({
  years,
  months,
  selectedYear,
  selectedMonth,
  selectedDate, // Add selectedDate
  onYearChange,
  onMonthChange,
  onDateChange, // Add onDateChange
}: DateSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State to control calendar visibility

  const handleDateSelect = (date: Date | undefined) => {
    onDateChange(date); // Call the onDateChange handler
    setIsCalendarOpen(false); // Close the calendar after selecting a date
  };

  return (
    <div className="flex gap-4">
      <Select value={selectedYear || "all"} onValueChange={onYearChange}>
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

      {!isNaN(Number(selectedYear)) && months && (
        <Select value={selectedMonth || "all"} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {monthNames[month as keyof typeof monthNames]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Add Date Picker */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect} // Use the custom handler
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
