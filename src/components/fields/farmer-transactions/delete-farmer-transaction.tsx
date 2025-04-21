// components/field/farmer/delete-farmer-transaction.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { deleteFarmerTransaction } from "@/lib/actions/farmer";

interface DeleteFarmerTransactionProps {
  fieldId: string;
  farmerId: string;
  transactionId: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
}

export function DeleteFarmerTransaction({
  farmerId,
  transactionId,
  date,
  amount,
  type,
}: DeleteFarmerTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    await deleteFarmerTransaction(farmerId, transactionId);
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
      />
    </>
  );
}
