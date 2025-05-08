"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil } from "lucide-react";
import { updateField } from "@/lib/actions/field";
import StatusAlert from "@/components/ui/status-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  fieldId: string;
  fieldName: string;
  totalArea: number;
  remainingArea: number;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  totalArea: z
    .string()
    .min(1, "Area is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Must be a valid positive number"),
});

type FormValues = {
  name: string;
  totalArea: string;
};

export default function EditFieldDialog({
  fieldId,
  fieldName,
  totalArea,
  remainingArea,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: fieldName,
      totalArea: totalArea.toString(),
    },
  });

  const onSubmit = async (values: FormValues) => {
    const newTotalArea = parseFloat(values.totalArea);
    
    // Calculate the minimum allowed total area based on allocated area
    const allocatedArea = totalArea - remainingArea;
    if (newTotalArea < allocatedArea) {
      setStatus({
        type: "error",
        message: `Total area cannot be less than allocated area (${allocatedArea.toFixed(2)} acres)`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateField(
        fieldId,
        values.name,
        newTotalArea
      );

      if (result.success) {
        setStatus({
          type: "success",
          message: "Field updated successfully",
        });
        setTimeout(() => {
          setOpen(false);
          setStatus({ type: null, message: null });
        }, 1500);
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to update field",
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
        <Button variant="outline" size="sm" className="h-8">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
          <DialogDescription>
            Allocated Area: {totalArea - remainingArea} acres
            <br />
            Remaining Area: {remainingArea} acres
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {status.type && (
              <StatusAlert
                status={{ message: status.message, type: status.type }}
              />
            )}

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Enter field name"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Area (Acres)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Field"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
