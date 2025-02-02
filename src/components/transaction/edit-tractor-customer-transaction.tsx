// edit-transaction.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { Path } from "react-hook-form";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/shared/edit-dialog";
import { updateTransaction } from "@/lib/actions/transaction";

// Define the schema with proper types
const editTransactionSchema = z.object({
  amount: z.coerce.number().positive("Must be a valid positive number"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
});

type EditTransactionFormData = z.infer<typeof editTransactionSchema>;

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
}

interface EditTransactionProps {
  transactionId: string;
  customerId: string;
  transaction: Transaction;
}

export function EditTransaction({
  transactionId,
  customerId,
  transaction,
}: EditTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: EditTransactionFormData) => {
    await updateTransaction(transactionId, customerId, {
      amount: values.amount,
      description: values.description,
      date: new Date(values.date),
    });
  };

  const fields: Array<{
    name: Path<EditTransactionFormData>;
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

  const initialData: EditTransactionFormData = {
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date.split("T")[0],
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
