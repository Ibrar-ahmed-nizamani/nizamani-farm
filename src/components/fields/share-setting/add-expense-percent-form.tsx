// components/fields/add-expense-form.tsx

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { addFarmerShareExpense } from "@/lib/actions/share-settings";
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

interface AddExpenseFormProps {
  shareType: string;
}

export default function AddExpenseForm({ shareType }: AddExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      farmerExpenseSharePercentage:
        shareType === "HALF" ? 50 : shareType === "THIRD" ? 33 : 25, // Default value based on share type
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      await addFarmerShareExpense({
        ...values,
        shareType,
      });

      form.reset();
      //   toast({
      //     title: "Expense added",
      //     description: "The expense has been added successfully.",
      //   });
      router.refresh();
    } catch {
      console.error("Failed to add expense:");
      //   toast({
      //     title: "Error",
      //     description: "Failed to add expense. Please try again.",
      //     variant: "destructive",
      //   });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Fertilizer" {...field} />
                </FormControl>
                <FormDescription>Enter the name of the expense</FormDescription>
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
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Expense"}
        </Button>
      </form>
    </Form>
  );
}
