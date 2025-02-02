// edit-expense.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { Path } from "react-hook-form";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/shared/edit-dialog";
import { updateTractorExpense } from "@/lib/actions/tractor-expense";

// Define the schema with proper types
const editExpenseSchema = z.object({
  amount: z.coerce.number().positive("Must be a valid positive number"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
});

type EditExpenseFormData = z.infer<typeof editExpenseSchema>;

interface Expense {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

interface EditExpenseProps {
  expenseId: string;
  tractorId: string;
  expense: Expense;
}

export function EditExpense({
  expenseId,
  tractorId,
  expense,
}: EditExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: EditExpenseFormData) => {
    await updateTractorExpense(expenseId, tractorId, {
      amount: values.amount,
      description: values.description,
      date: new Date(values.date),
    });
  };

  const fields: Array<{
    name: Path<EditExpenseFormData>;
    label: string;
    type: "text" | "number" | "date";
    placeholder?: string;
  }> = [
    {
      name: "amount",
      label: "Amount",
      type: "number",
      placeholder: "Enter amount",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter description",
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      placeholder: "Select date",
    },
  ];

  const initialData: EditExpenseFormData = {
    amount: expense.amount,
    description: expense.description,
    date: expense.date.split("T")[0],
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
