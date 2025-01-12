// app/milk/customers/[id]/add-milk-record-form.tsx
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
import { Loader2 } from "lucide-react";
import {
  addMilkRecord,
  updateMilkCustomerDefaults,
} from "@/lib/actions/milk-customer-actions";
import StatusAlert from "@/components/ui/status-alert";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Must be a valid positive number"),
  price: z
    .string()
    .min(1, "Price is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Must be a valid positive number"),
});

interface Props {
  customerId: string;
  defaultQuantity?: number;
  defaultPrice?: number;
}

export default function AddCustomerMilkForm({
  customerId,
  defaultQuantity = 0,
  defaultPrice = 0,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      quantity: defaultQuantity,
      price: defaultPrice,
    },
  });

  const handleStatusChange = (
    newStatus: {
      type: "success" | "error" | null;
      message: string | null;
    } | null
  ) => {
    setStatus(newStatus || { type: null, message: null });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Update defaults if they've changed
      const newQuantity = Number(values.quantity);
      const newPrice = Number(values.price);
      if (newQuantity !== defaultQuantity || newPrice !== defaultPrice) {
        await updateMilkCustomerDefaults(customerId, newQuantity, newPrice);
      }

      const result = await addMilkRecord(
        customerId,
        new Date(values.date),
        newQuantity,
        newPrice
      );

      if (result.success) {
        setStatus({
          type: "success",
          message: "Milk record added successfully",
        });
        form.setValue("date", new Date().toISOString().split("T")[0]);
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to add milk record",
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
            onStatusChange={handleStatusChange}
          />
        )}

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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity (L)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (Rs )</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Record...
            </>
          ) : (
            "Add Record"
          )}
        </Button>
      </form>
    </Form>
  );
}
