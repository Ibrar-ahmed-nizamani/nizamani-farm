"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { deleteFarmer } from "@/lib/actions/farmer";
import StatusAlert from "@/components/ui/status-alert";

interface Props {
  fieldId: string;
  farmerId: string;
  farmerName: string;
}

export default function DeleteFarmerDialog({ farmerId, farmerName }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteFarmer(farmerId);
      if (result.success) {
        setStatus({
          type: "success",
          message: "Farmer deleted successfully",
        });
        setTimeout(() => {
          setOpen(false);
          setStatus({ type: null, message: null });
        }, 1500);
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to delete farmer",
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
        <Button variant="destructive" size="sm" className="h-8 gap-1">
          <Trash2 className="size-4" />

        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Farmer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {farmerName}? This action cannot be undone.
            All transactions associated with this farmer will also be deleted.
          </DialogDescription>
        </DialogHeader>

        {status.type && (
          <StatusAlert status={{ message: status.message, type: status.type }} />
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Farmer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
