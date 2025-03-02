// components/fields/add-farmer-form.tsx
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
import { Loader2 } from "lucide-react";
import { addFarmerToField } from "@/lib/actions/farmer";
import StatusAlert from "@/components/ui/status-alert";

interface Props {
  fieldId: string;
  maxArea: number;
}
// components/fields/add-farmer-form.tsx
const formSchema = z.object({
  farmerName: z.string().min(1, "Farmer name is required"),
  shareType: z.enum(["1/3", "1/2", "1/4"]), // Updated shareType
  allocatedArea: z
    .string()
    .min(1, "Allocated area is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Must be a valid positive number"),
});

export default function AddFarmerForm({ fieldId, maxArea }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmerName: "",
      shareType: "1/2", // Default to "1/2"
      allocatedArea: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.allocatedArea > maxArea) {
      setStatus({
        type: "error",
        message: `Allocated area cannot exceed ${maxArea} acres`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await addFarmerToField(
        fieldId,
        values.farmerName,
        values.shareType,
        values.allocatedArea
      );
      if (result.success) {
        setStatus({
          type: "success",
          message: "Farmer added successfully",
        });
        form.reset();
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to add farmer",
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

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="farmerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farmer Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Enter farmer name"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shareType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Share Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select share type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1/2">50%</SelectItem>
                    <SelectItem value="1/3">One Third (1/3)</SelectItem>
                    <SelectItem value="1/4">25%</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allocatedArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allocated Area (Acres)</FormLabel>
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Farmer...
              </>
            ) : (
              "Add Farmer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
