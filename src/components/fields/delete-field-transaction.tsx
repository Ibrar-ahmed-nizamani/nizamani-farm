// components/fields/field-transactions/delete-field-transaction.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { formatDatePattern } from "@/lib/utils";
import { deleteFieldExpense } from "@/lib/actions/field";

interface DeleteFieldTransactionProps {
  fieldId: string;
  farmerId: string;
  transaction: {
    _id: string;
    type: "expense" | "income";
    amount: number;
    date: Date | string;
    description: string;
  };
}

export function DeleteFieldTransaction({
  fieldId,
  farmerId,
  transaction,
}: DeleteFieldTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteFieldExpense(fieldId, farmerId, transaction._id);
      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formattedDate =
    typeof transaction.date === "string"
      ? new Date(transaction.date).toLocaleDateString()
      : formatDatePattern(transaction.date);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${
          transaction.type === "expense" ? "Expense" : "Income"
        }`}
        description={`Are you sure you want to delete this ${
          transaction.type
        } of Rs ${transaction.amount.toLocaleString()} from ${formattedDate}? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </>
  );
}
