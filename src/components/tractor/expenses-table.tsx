"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import DeleteExpenseDialog from "./delete-expense";
import { formatDatePattern } from "@/lib/utils";

interface ExpensesTableProps {
  expenses: {
    _id: string;
    description: string;
    amount: number;
    date: string;
  }[];
  tractorId: string;
}

export default function ExpensesTable({
  expenses,
  tractorId,
}: ExpensesTableProps) {
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense._id.toString()}>
              <TableCell>{expense.description}</TableCell>
              <TableCell>Rs {expense.amount.toLocaleString()}</TableCell>
              <TableCell>{formatDatePattern(expense.date)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                  onClick={() => setDeleteExpenseId(expense._id.toString())}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {deleteExpenseId && (
        <DeleteExpenseDialog
          expenseId={deleteExpenseId}
          tractorId={tractorId}
          isOpen={!!deleteExpenseId}
          onClose={() => setDeleteExpenseId(null)}
        />
      )}
    </div>
  );
}
