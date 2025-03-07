"use client";
import React from "react";
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
import BackLink from "@/components/ui/back-link";
import { formatDatePattern, getDateRangeDescription } from "@/lib/utils";
import PrintMilkSummary from "./print-summary";
import DateRangeSelector from "@/components/shared/date-range-selector";
import { CardDescription } from "@/components/ui/card";

export default function MilkSummaryPage({
  expenses,
  customerRecords,
  customerDebits,
  years,
  months,
  startDate,
  endDate,
  selectedYear,
  selectedMonth,
}: MilkSummaryData) {
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
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

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

  const dateRangeDescription = getDateRangeDescription({
    selectedYear: selectedYear ? selectedYear : "all",
    endDate,
    startDate,
    selectedMonth,
  });

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Milk Summary</h1>
        <div>
          <BackLink href="/milk" linkText="Back to Milk Page" />
        </div>
      </div>
      <div className="flex gap-4 items-center justify-between">
        <CardDescription>{dateRangeDescription}</CardDescription>
        <PrintMilkSummary
          transactions={transactionsWithBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalBalance={totalBalance}
          selectedYear={selectedYear ? selectedYear : "all"}
          selectedMonth={selectedMonth}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      <DateRangeSelector availableYears={years} availableMonths={months} />
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
