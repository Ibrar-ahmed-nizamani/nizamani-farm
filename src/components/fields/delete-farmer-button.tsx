'use client'
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { softDeleteFarmer } from "@/lib/actions/farmer";
import { useRouter } from "next/navigation";

interface DeleteFarmerButtonProps {
  farmerId: string;
  farmerName: string;
  fieldId: string;
}

export default function DeleteFarmerButton({
  farmerId,
  farmerName,
  fieldId,
}: DeleteFarmerButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await softDeleteFarmer(farmerId);
      if (result.success) {
        router.push(`/fields/${fieldId}`);
      } else {
        alert(result.error || "Failed to delete farmer");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the farmer");
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="default"
        onClick={() => setIsDialogOpen(true)}
        className="gap-2"
      >
        <Trash2 className="size-4" />
        Delete Farmer
      </Button>

      <DeleteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${farmerName}?`}
        description="Are you sure you want to delete this farmer? This action will remove the farmer from the list, but their data will be preserved."
        isLoading={isDeleting}
      />
    </>
  );
}
