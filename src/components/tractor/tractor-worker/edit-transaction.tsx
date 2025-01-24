"use client";

import { useState } from "react";
import { z } from "zod";
import { Path } from "react-hook-form";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/shared/edit-dialog";
import { updateTractorEmployeeTransaction } from "@/lib/actions/tractor-employee";

const editTransactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(["debit", "credit"]),
  amount: z.coerce.number().positive("Must be a valid positive number"),
  description: z.string().min(1, "Description is required"),
});

type EditTransactionFormData = z.infer<typeof editTransactionSchema>;

interface Transaction {
  _id: string;
  date: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
}

interface EditTransactionProps {
  employeeId: string;
  transaction: Transaction;
}

export function EditTractorEmployeeTransaction({
  employeeId,
  transaction,
}: EditTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: EditTransactionFormData) => {
    await updateTractorEmployeeTransaction(
      employeeId,
      transaction._id,
      values.type,
      values.amount,
      new Date(values.date),
      values.description
    );
  };

  const fields: Array<{
    name: Path<EditTransactionFormData>;
    label: string;
    type: "text" | "number" | "date" | "textarea" | "select";
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
      name: "type",
      label: "Type",
      type: "select",
      placeholder: "Select type",
      options: [
        { label: "Credit", value: "credit" },
        { label: "Debit", value: "debit" },
      ],
    },
    {
      name: "amount",
      label: "Amount (Rs)",
      type: "number",
      placeholder: "Enter amount",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description",
    },
  ];

  const initialData: EditTransactionFormData = {
    date: transaction.date.split("T")[0],
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
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
        title="Edit Transaction"
        initialData={initialData}
        schema={editTransactionSchema}
        fields={fields}
      />
    </>
  );
}
