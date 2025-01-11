import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

// formate 11/01/2025 to 11 - 01 - 2025
export function formatDate(dateString: string): string {
  // Split the date string by '/'
  const [day, month, year] = dateString.split("/");

  // Join with ' - ' spacing
  return `${day} - ${month} - ${year}`;
}
