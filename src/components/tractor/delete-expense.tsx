import { deleteTractorExpense } from "@/lib/actions/tractor-expense";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteDialog } from "../ui/delete-dialog";

export default function DeleteExpenseDialog({
  expenseId,
  tractorId,
  isOpen,
  onClose,
}: {
  expenseId: string;
  tractorId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!expenseId) return;
    setIsDeleting(true);
    const result = await deleteTractorExpense(expenseId, tractorId);
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
      title="Delete Expense"
      description="Are you sure you want to delete this expense? This action cannot be undone."
      isLoading={isDeleting}
    />
  );
}
