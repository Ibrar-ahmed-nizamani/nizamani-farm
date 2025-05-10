"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteField } from "@/lib/actions/field";
import StatusAlert from "@/components/ui/status-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Props {
  fieldId: string;
  fieldName: string;
  farmerCount: number;
}

export default function DeleteFieldDialog({
  fieldId,
  fieldName,
  farmerCount,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const handleDelete = async () => {
    if (farmerCount > 0) {
      setStatus({
        type: "error",
        message: "Cannot delete field with associated farmers. Remove all farmers first.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteField(fieldId);

      if (result.success) {
        setStatus({
          type: "success",
          message: "Field deleted successfully",
        });
        setTimeout(() => {
          setOpen(false);
          setStatus({ type: null, message: null });
          router.refresh(); // Force a refresh of the page data
        }, 1500);
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to delete field",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="h-8">
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Field</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the field &quot;{fieldName}&quot;? This action cannot be undone.
            {farmerCount > 0 && (
              <span>
                This field has {farmerCount} farmer{farmerCount > 1 ? "s" : ""} associated with it. 
                You must remove all farmers before deleting this field.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {status.type && (
          <StatusAlert
            status={{ message: status.message, type: status.type }}
          />
        )}

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading || farmerCount > 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Field"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
