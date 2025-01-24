import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MilkExpense } from "./type-definitions";

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
