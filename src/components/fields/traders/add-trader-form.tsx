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
import { addFieldTrader } from "@/lib/actions/field-trader";
import StatusAlert from "@/components/ui/status-alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
});

export default function AddTraderForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
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
      const result = await addFieldTrader(values.name);
      if (result.success) {
        setStatus({
          type: "success",
          message: "Trader added successfully",
        });
        form.reset();
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to add trader",
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
            status={{ message: status.message, type: status.type }}
            onStatusChange={handleStatusChange}
          />
        )}

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Trader Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter trader name"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="self-end">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Trader"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
