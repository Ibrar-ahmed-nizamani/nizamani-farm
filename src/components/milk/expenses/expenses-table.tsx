"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteMilkExpenseDialog from "./delete-expense-dialog";
import { formatDatePattern } from "@/lib/utils";
import { EditExpense } from "./edit-expense";

interface MilkExpense {
  _id: string;
  amount: number;
  date: string;
  type: {
    _id: string;
    name: string;
  };
}

interface ExpenseType {
  _id: string;
  name: string;
}

export default function MilkExpensesTable({
  expenses,
  expenseTypes,
}: {
  expenses: MilkExpense[];
  expenseTypes: ExpenseType[];
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>("");

  const handleDeleteClick = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Expense Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>{formatDatePattern(expense.date)}</TableCell>
                <TableCell>{expense.type.name}</TableCell>
                <TableCell>Rs {expense.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <EditExpense
                    expense={{
                      _id: expense._id,
                      date: expense.date,
                      typeId: expense.type._id,
                      amount: expense.amount,
                      type: expense.type,
                    }}
                    expenseTypes={expenseTypes}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    onClick={() => handleDeleteClick(expense._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteMilkExpenseDialog
        expenseId={selectedExpenseId}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedExpenseId("");
        }}
      />
    </>
  );
}
