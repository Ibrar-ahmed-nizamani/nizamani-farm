"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { deleteFieldExpense } from "@/lib/actions/share-settings";

interface DeleteWorkerTransactionProps {
  expenseId: string;
}

export function DeleteShareExpense({
  expenseId,
}: DeleteWorkerTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteFieldExpense(expenseId);
      if (result.success) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete share expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        title="Delete Transaction"
        description={`Are you sure you want to delete this share expense? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </>
  );
}
