// components/milk/summary.tsx
"use client";

import React from "react";
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
import { formatDatePattern } from "@/lib/utils";
import PrintMilkSummary from "./print-summary";
import { Button } from "@/components/ui/button";

export default function MilkSummaryPage({
  expenses,
  customerRecords,
  customerDebits,
  years,
  months,
}: MilkSummaryData) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("date");
    if (year === "today") {
      params.delete("year");
      params.delete("month");
      params.set("date", "today");
    }

    if (year === "all" || year === "today") {
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
    params.delete("date");
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
    ...customerRecords.map((record) => ({
      date: new Date(record.date),
      type: "income" as const,
      description: record.customerName,
      amount: record.amount,
      details: `${record.quantity} litres / Rs ${record.price}`,
    })),
    ...customerDebits.map((debit) => ({
      date: new Date(debit.date),
      type: "income" as const,
      description: debit.customerName,
      amount: debit.amount,
      details: `${debit.description}`,
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
      <div className="flex gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <DateSelector
            years={years}
            months={months}
            selectedYear={
              searchParams.get("year") || searchParams.get("date") || undefined
            }
            selectedMonth={searchParams.get("month") || undefined}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
          />
        </div>
        <PrintMilkSummary
          transactions={transactionsWithBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalBalance={totalBalance}
          selectedYear={
            searchParams.get("year") || searchParams.get("date") || undefined
          }
          selectedMonth={searchParams.get("month") || undefined}
        />
      </div>
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
              <TableCell>
                {formatDatePattern(transaction.date.toISOString())}
              </TableCell>
              <TableCell>
                {transaction.type === "income" ? transaction.description : "-"}
              </TableCell>
              <TableCell>
                {transaction.type === "expense" ? transaction.description : "-"}
              </TableCell>
              <TableCell>{transaction.details}</TableCell>
              <TableCell className="text-right">
                {transaction.amount > 0
                  ? `Rs ${transaction.amount.toFixed(0)}`
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                {transaction.amount < 0
                  ? `Rs ${Math.abs(transaction.amount).toFixed(0)}`
                  : "-"}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  transaction.balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                Rs {Math.abs(transaction.balance).toFixed(0)}{" "}
                {transaction.balance > 0 ? "Cr" : "Dr"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
