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
import { addMilkExpenseType } from "@/lib/actions/milk-expense";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import StatusAlert from "@/components/ui/status-alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
});

export default function AddExpenseTypeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (status.type === "success") {
      timeoutId = setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [status]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await addMilkExpenseType(values.name);
      if (result.success) {
        setStatus({
          type: "success",
          message: "Expense type added successfully",
        });
        form.reset();
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to add expense type",
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Type Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter expense type name"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Expense Type"
          )}
        </Button>

        {status.type && (
          <StatusAlert
            status={{
              message: status.message,
              type: status.type,
            }}
          />
        )}
      </form>
    </Form>
  );
}
