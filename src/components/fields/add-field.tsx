// components/fields/add-field-form.tsx
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
import { addField } from "@/lib/actions/field";
import StatusAlert from "@/components/ui/status-alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  totalArea: z
    .string()
    .min(1, "Area is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Must be a valid positive number"),
  // location: z.string().min(2, "Location must be at least 2 characters").trim(),
});

export default function AddFieldForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      totalArea: "",
      location: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await addField(
        values.name,
        values.totalArea
        // values.location
      );
      if (result.success) {
        setStatus({
          type: "success",
          message: "Field added successfully",
        });
        form.reset();
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to add field",
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
          />
        )}

        <div className="space-y-3 w-96">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
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

          {/* <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>

        <div className="flex ">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Field...
              </>
            ) : (
              "Add Field"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
