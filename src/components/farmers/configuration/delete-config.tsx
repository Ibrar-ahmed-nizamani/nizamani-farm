"use client";

import { deleteFarmerConfig } from "@/lib/newActions/farmerActions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteFarmerConfig({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to delete this configuration?")) {
          startTransition(() => {
            deleteFarmerConfig(id);
          });
        }
      }}
      className="text-destructive hover:text-destructive/90"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
