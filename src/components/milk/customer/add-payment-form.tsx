"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";

import { Loader2 } from "lucide-react";
import { addMilkPayment } from "@/lib/actions/milk-customer-actions";
import StatusAlert from "@/components/ui/status-alert";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
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
  amount: string;
  description: string;
};

interface Props {
  customerId: string;
}

export default function AddPaymentForm({ customerId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "Milk Payment",
    },
  });

  const onSubmit = async (values: FormInput) => {
    setIsLoading(true);
    try {
      const result = await addMilkPayment(
        customerId,
        parseFloat(values.amount),
        new Date(values.date),
        values.description
      );

      if (result.success) {
        setStatus({
          type: "success",
          message: "Payment added successfully",
        });
        // Redirect to transactions page after successful payment
        router.push(`/milk/customers/${customerId}/transactions`);
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to add payment",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {status.type && (
          <StatusAlert
            status={{ type: status.type, message: status.message }}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (Rs )</FormLabel>
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

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Payment...
              </>
            ) : (
              "Add Payment"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
