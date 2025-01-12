"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteMilkWorkerTransaction } from "@/lib/actions/milk-worker";
import { DeleteDialog } from "@/components/ui/delete-dialog";

interface DeleteWorkerTransactionProps {
  workerId: string;
  transactionId: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
}

export function DeleteWorkerTransaction({
  workerId,
  transactionId,
  date,
  amount,
  type,
}: DeleteWorkerTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteMilkWorkerTransaction(workerId, transactionId);
      if (result.success) {
        setIsOpen(false);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
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
        description={`Are you sure you want to delete the ${type} transaction of Rs ${amount.toLocaleString()} from ${date}? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </>
  );
}
