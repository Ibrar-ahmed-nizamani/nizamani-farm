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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { addTransaction } from "@/lib/actions/transaction";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(["DEBIT", "CREDIT"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Must be a valid positive number"),
  description: z.string().min(1, "Description is required"),
});

// Define the shape of the form values (before transformation)
type FormInput = {
  date: string;
  type: "DEBIT" | "CREDIT";
  amount: string;
  description: string;
};

interface Props {
  customerId: string;
}

export default function CustomerTransactionForm({ customerId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "CREDIT",
      amount: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("customerId", customerId);
      formData.append("date", values.date);
      formData.append("type", values.type);
      formData.append("amount", values.amount);
      formData.append("description", values.description);

      // The server action will handle redirect on success
      const result = await addTransaction(null, formData);

      if (result && !result.success) {
        setError(result.message || "Failed to add transaction");
      }
    } catch {
      setError("An error occurred while adding the transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (Rs)</FormLabel>
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Transaction...
              </>
            ) : (
              "Add Transaction"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
