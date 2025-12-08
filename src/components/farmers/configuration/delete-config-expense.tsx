"use client";

import { removeExpenseFromConfig } from "@/lib/newActions/farmerActions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            disabled={pending}
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    )
}

export function DeleteConfigExpense({ configId, categoryId }: { configId: string, categoryId: string }) {
  return (
    <form action={removeExpenseFromConfig.bind(null, configId, categoryId)}>
      <DeleteButton />
    </form>
  );
}
