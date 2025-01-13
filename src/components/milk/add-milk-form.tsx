"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { addMilkRecord } from "@/lib/actions/milk";
import { useRouter } from "next/navigation";

import { useState } from "react";
import StatusAlert from "../ui/status-alert";
import { Loader2 } from "lucide-react";

// Define the input schema (what the form handles)
const formSchema = z.object({
  date: z.string().nonempty("Date is required"),
  amMilk: z
    .string()
    .nonempty("AM milk is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, "Must be a valid number"),
  pmMilk: z
    .string()
    .nonempty("PM milk is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, "Must be a valid number"),
});

// Define the shape of the form values (before transformation)
type FormInput = {
  date: string;
  amMilk: string;
  pmMilk: string;
};

// Define the shape of the transformed values
type TransformedValues = {
  date: Date;
  amMilk: number;
  pmMilk: number;
};

export default function AddMilkForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amMilk: "",
      pmMilk: "",
    },
  });

  const onSubmit = async (values: FormInput) => {
    setIsSubmitting(true);
    setStatus({ type: null, message: null });

    try {
      // Transform the values explicitly
      const transformedValues: TransformedValues = {
        date: new Date(values.date),
        amMilk: parseFloat(values.amMilk),
        pmMilk: parseFloat(values.pmMilk),
      };

      const result = await addMilkRecord(transformedValues);

      if (result.success) {
        setStatus({
          type: "success",
          message: "Milk record added successfully",
        });
        router.push("/milk/milk-records");
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to add milk record",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "An error occurred while adding the record",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-md"
      >
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amMilk"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AM Milk (Liters)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pmMilk"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PM Milk (Liters)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Record"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/milk/milk-records")}
          >
            Cancel
          </Button>
        </div>
        {status.type && (
          <StatusAlert
            status={{ message: status.message, type: status.type }}
          />
        )}
      </form>
    </Form>
  );
}
