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
import { addEquipment } from "@/lib/actions/equipment-rate";
import StatusAlert from "@/components/ui/status-alert";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .trim()
    .toLowerCase(),
  rate: z.coerce
    .number()
    .min(1, "Rate must be greater than 0")
    .max(100000, "Rate seems too high"),
});

export default function AddEquipmentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rate: 0,
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
      const result = await addEquipment(values.name, values.rate);
      if (result.success) {
        setStatus({
          type: "success",
          message: "Equipment added successfully",
        });
        form.reset();
        router.push("/tractor");
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to add equipment",
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-md"
      >
        {status.type && (
          <StatusAlert
            status={{ message: status.message, type: status.type }}
            onStatusChange={handleStatusChange}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter equipment name"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter rate"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Equipment"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
