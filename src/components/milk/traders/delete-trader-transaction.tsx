// components/milk/trader/delete-trader-transaction.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteMilkTraderTransaction } from "@/lib/actions/milk-trader";
import { DeleteDialog } from "@/components/ui/delete-dialog";

interface DeleteTraderTransactionProps {
  traderId: string;
  transactionId: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
}

export function DeleteTraderTransaction({
  traderId,
  transactionId,
  date,
  amount,
  type,
}: DeleteTraderTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteMilkTraderTransaction(traderId, transactionId);
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
