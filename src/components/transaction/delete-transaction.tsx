"use client";

import { deleteTransaction } from "@/lib/actions/transaction";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteDialog } from "../ui/delete-dialog";

export default function DeleteTransactionDialog({
  transactionId,
  customerId,
  isOpen,
  onClose,
}: {
  transactionId: string;
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!transactionId) return;
    setIsDeleting(true);
    const result = await deleteTransaction(transactionId, customerId);
    if (result.success) {
      router.refresh();
    }
    setIsDeleting(false);
    onClose();
  };

  return (
    <DeleteDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Transaction"
      description="Are you sure you want to delete this transaction? This action cannot be undone."
      isLoading={isDeleting}
    />
  );
}
