"use client";

import { useState } from "react";
import { z } from "zod";
import { Path } from "react-hook-form";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/shared/edit-dialog";
import { updateMilkExpense } from "@/lib/actions/milk-expense";

const editExpenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  typeId: z.string().min(1, "Expense type is required"),
  amount: z.coerce.number().positive("Must be a valid positive number"),
});

type EditExpenseFormData = z.infer<typeof editExpenseSchema>;

interface ExpenseType {
  _id: string;
  name: string;
}

interface Expense {
  _id: string;
  date: string;
  typeId: string;
  amount: number;
  type: ExpenseType;
}

interface EditExpenseProps {
  expense: Expense;
  expenseTypes: ExpenseType[];
}

export function EditExpense({ expense, expenseTypes }: EditExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: EditExpenseFormData) => {
    await updateMilkExpense(expense._id, {
      typeId: values.typeId,
      amount: values.amount,
      date: new Date(values.date),
    });
  };

  const fields: Array<{
    name: Path<EditExpenseFormData>;
    label: string;
    type: "text" | "number" | "date" | "select";
    placeholder?: string;
    options?: { label: string; value: string }[];
  }> = [
    {
      name: "date",
      label: "Date",
      type: "date",
      placeholder: "Select date",
    },
    {
      name: "typeId",
      label: "Expense Type",
      type: "select",
      placeholder: "Select expense type",
      options: expenseTypes.map((type) => ({
        label: type.name,
        value: type._id,
      })),
    },
    {
      name: "amount",
      label: "Amount (Rs)",
      type: "number",
      placeholder: "Enter amount",
    },
  ];

  const initialData: EditExpenseFormData = {
    date: new Date(expense.date).toISOString().split("T")[0],
    typeId: expense.typeId,
    amount: expense.amount,
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <PencilIcon className="h-4 w-4" />
      </Button>

      <EditDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="Edit Expense"
        initialData={initialData}
        schema={editExpenseSchema}
        fields={fields}
      />
    </>
  );
}
