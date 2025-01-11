// components/milk/summary.tsx
"use client";

import React from "react";
import { format } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SummaryCards from "@/components/shared/summary-cards";

import { MilkSummaryData, Transaction } from "@/lib/type-definitions";
import DateSelector from "./date-selector";
import BackLink from "@/components/ui/back-link";

export default function MilkSummaryPage({
  expenses,
  workerCredits,
  customerRecords,
  years,
  months,
}: MilkSummaryData) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    if (year === "all") {
      params.delete("year");
      params.delete("month");
    } else {
      params.set("year", year);
      params.delete("month");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams);
    if (month === "all") {
      params.delete("month");
    } else {
      params.set("month", month);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Combine and format all transactions
  const allTransactions: Transaction[] = [
    ...expenses.map((exp) => ({
      date: new Date(exp.date),
      type: "expense" as const,
      description: `${exp.type.name}`,
      amount: -exp.amount,
      details: "-",
    })),
    ...workerCredits.map((credit) => ({
      date: new Date(credit.date),
      type: "expense" as const,
      description: `Worker : ${credit.worker.name}`,
      amount: -credit.amount,
      details: credit.description || "-",
    })),
    ...customerRecords.map((record) => ({
      date: new Date(record.date),
      type: "income" as const,
      description: record.customerName,
      amount: record.amount,
      details: `${record.quantity} litres / Rs ${record.price}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate running balance
  let runningBalance = 0;
  const transactionsWithBalance = allTransactions.map((transaction) => {
    runningBalance += transaction.amount;
    return { ...transaction, balance: runningBalance };
  });

  const totalIncome = transactionsWithBalance.reduce(
    (sum, t) => sum + (t.amount > 0 ? t.amount : 0),
    0
  );

  const totalExpense = Math.abs(
    transactionsWithBalance.reduce(
      (sum, t) => sum + (t.amount < 0 ? t.amount : 0),
      0
    )
  );

  const totalBalance = totalIncome - totalExpense;

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Milk Summary</h1>
        <div>
          <BackLink href="/milk" linkText="Back to Milk Page" />
        </div>
      </div>
      <DateSelector
        years={years}
        months={months}
        selectedYear={searchParams.get("year") || undefined}
        selectedMonth={searchParams.get("month") || undefined}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
      />

      <SummaryCards
        cards={[
          {
            label: "Total Income",
            value: totalIncome,
            type: "income",
          },
          {
            label: "Total Expenses",
            value: totalExpense,
            type: "expense",
          },
          {
            label: "Net Revenue",
            value: totalBalance,
            type: "balance",
          },
        ]}
      />

      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Expense Detail</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Income</TableHead>
            <TableHead className="text-right">Expense</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionsWithBalance.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>{format(transaction.date, "MMM d, yyyy")}</TableCell>
              <TableCell>
                {transaction.type === "income" ? transaction.description : "-"}
              </TableCell>
              <TableCell>
                {transaction.type === "expense" ? transaction.description : "-"}
              </TableCell>
              <TableCell>{transaction.details}</TableCell>
              <TableCell className="text-right">
                {transaction.amount > 0 ? `Rs ${transaction.amount} Cr` : "-"}
              </TableCell>
              <TableCell className="text-right">
                {transaction.amount < 0
                  ? `Rs ${Math.abs(transaction.amount)} Dr`
                  : "-"}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  transaction.balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                Rs {transaction.balance}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
