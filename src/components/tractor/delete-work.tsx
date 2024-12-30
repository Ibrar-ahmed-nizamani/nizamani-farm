import { deleteWork } from "@/lib/actions/work";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteDialog } from "../ui/delete-dialog";

export default function DeleteWorkDialog({
  workId,
  tractorId,
  isOpen,
  onClose,
}: {
  workId: string;
  tractorId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!workId) return;
    setIsDeleting(true);
    const result = await deleteWork(workId, tractorId);
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
      title="Delete Work"
      description="Are you sure you want to delete this work? This action cannot be undone."
      isLoading={isDeleting}
    />
  );
}
