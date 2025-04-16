import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MilkExpense } from "./type-definitions";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function monthNumberToName(month: number): string {
  const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (month < 1 || month > 12) {
    throw new Error("Invalid month number. It must be between 1 and 12.");
  }

  return months[month - 1];
}

export function formatDatePattern(inputDate: string | Date) {
  const date = new Date(inputDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  return `${day} - ${month} - ${year}`;
}

export function generateMilkExpensesSummary(expenses: MilkExpense[]) {
  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Group expenses by type
  const expensesByType = expenses.reduce((acc, expense) => {
    const typeName = expense.type.name;
    const existingType = acc.find((item) => item.name === typeName);

    if (existingType) {
      existingType.amount += expense.amount;
    } else {
      acc.push({
        name: typeName,
        amount: expense.amount,
      });
    }

    return acc;
  }, [] as { name: string; amount: number }[]);

  // Sort expense types by amount in descending order
  expensesByType.sort((a, b) => b.amount - a.amount);

  return {
    totalExpenses,
    expensesByType,
  };
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return str; // Return the original string if it's empty
  return str.charAt(0).toUpperCase() + str.slice(1);
}


export function convertShareTypes(share: string, ui: boolean = false) {
  if (share === "1/2" && ui === false) {
    return "HALF";
  }
  if (share === "1/2" && ui) {
    return "50%";
  }
  if (share === "1/3" && ui === false) {
    return "THIRD";
  }
  if (share === "1/3" && ui) {
    return "33%";
  }
  if (share === "1/4" && ui === false) {
    return "QUARTER";
  }
  if (share === "1/4" && ui) {
    return "25%";
  }

export function getDateRangeDescription({
  startDate,
  endDate,
  selectedYear,
  selectedMonth,
}: {
  startDate?: string;
  endDate?: string;
  selectedYear: string;
  selectedMonth?: string;
}): string {
  // Helper function to format date with a consistent pattern
  const formatDatePattern = (date: string) => {
    return format(new Date(date), "PP");
  };

  // Specific date range with both start and end dates
  if (startDate && endDate) {
    return `${format(new Date(startDate), "PPP")} to ${format(
      new Date(endDate),
      "PPP"
    )}`;
  }

  // Only start date provided
  if (startDate) {
    return `From ${formatDatePattern(startDate)}`;
  }

  // Only end date provided
  if (endDate) {
    return `Until ${formatDatePattern(endDate)}`;
  }

  // Specific month and year selected
  if (selectedYear !== "all" && selectedMonth && selectedMonth !== "all") {
    const monthDate = new Date(
      parseInt(selectedYear),
      parseInt(selectedMonth) - 1,
      1
    );
    return `${monthDate.toLocaleString("default", {
      month: "long",
    })} ${selectedYear}`;
  }

  // Only year selected
  if (selectedYear !== "all") {
    return `Year ${selectedYear}`;
  }

  // No specific date range selected
  return "All Time";

}
