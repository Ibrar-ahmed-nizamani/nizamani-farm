"use client";

import { useState } from "react";
import { MoreVertical, Trash2,  } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DeleteExpenseDialog from "./delete-expense";

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
              <TableCell>
                {new Date(expense.date).toLocaleDateString("en-GB")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteExpenseId(expense._id.toString())}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
