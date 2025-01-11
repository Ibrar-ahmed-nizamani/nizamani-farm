// components/delete-milk-record.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteMilkRecord } from "@/lib/actions/milk-customer-actions";
import { DeleteDialog } from "@/components/ui/delete-dialog";

interface DeleteMilkRecordProps {
  customerId: string;
  recordId: string;
  date: string;
}

export function DeleteMilkRecord({
  customerId,
  recordId,
  date,
}: DeleteMilkRecordProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteMilkRecord(customerId, recordId);
      if (result.success) {
        setIsOpen(false);
      } else {
        // Handle error
        console.error(result.error);
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
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
        title="Delete Milk Record"
        description={`Are you sure you want to delete the milk record for ${date}? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </>
  );
}
