// components/fields/edit-expense-modal.tsx

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  deleteFieldExpense,
  updateFieldExpense,
} from "@/lib/actions/share-settings";
// import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Expense name must be at least 2 characters.",
  }),
  farmerExpenseSharePercentage: z.coerce
    .number()
    .min(0, { message: "Percentage must be at least 0." })
    .max(100, { message: "Percentage cannot exceed 100." }),
});

interface ExpenseData {
  _id: string;
  name: string;
  farmerExpenseSharePercentage: number;
}

interface EditExpenseModalProps {
  expense: ExpenseData;
}

export default function EditExpenseModal({ expense }: EditExpenseModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: expense.name,
      farmerExpenseSharePercentage: expense.farmerExpenseSharePercentage,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      await updateFieldExpense(expense._id, values);

      //   toast({
      //     title: "Expense updated",
      //     description: "The expense has been updated successfully.",
      //   });
      setIsOpen(false);
      router.refresh();
    } catch {
      console.error("Failed to update expense:");
      //   toast({
      //     title: "Error",
      //     description: "Failed to update expense. Please try again.",
      //     variant: "destructive",
      //   });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await deleteFieldExpense(expense._id);

      //   toast({
      //     title: "Expense deleted",
      //     description: "The expense has been deleted successfully.",
      //   });
      setIsOpen(false);
      router.refresh();
    } catch {
      console.error("Failed to delete expense:");
      //   toast({
      //     title: "Error",
      //     description: "Failed to delete expense. Please try again.",
      //     variant: "destructive",
      //   });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the expense details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fertilizer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="farmerExpenseSharePercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmer Share Percentage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage of expense the farmer will pay
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
