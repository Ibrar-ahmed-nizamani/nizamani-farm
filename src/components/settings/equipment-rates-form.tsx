"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateEquipmentRate } from "@/lib/actions/equipment-rate";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StatusAlert from "../ui/status-alert";

interface EquipmentRate {
  _id: string;
  name: string;
  rate: number;
}

interface EquipmentRatesFormProps {
  initialRates: EquipmentRate[];
}

// Create a dynamic schema based on initial rates
const createFormSchema = (initialRates: EquipmentRate[]) => {
  const rateFields: Record<
    string,
    z.ZodEffects<
      z.ZodOptional<z.ZodString>,
      number | undefined,
      string | undefined
    >
  > = {};

  initialRates.forEach((equipment) => {
    rateFields[equipment._id] = z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      });
  });

  return z.object(rateFields);
};

export default function EquipmentRatesForm({
  initialRates,
}: EquipmentRatesFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const formSchema = createFormSchema(initialRates);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialRates.reduce(
      (acc, equipment) => ({
        ...acc,
        [equipment._id]: "",
      }),
      {}
    ),
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setStatus({ type: null, message: null });

    try {
      const updatePromises = Object.entries(values)
        .filter(([, rate]) => rate !== undefined)
        .map(([id, rate]) => updateEquipmentRate(id, rate as number));

      const results = await Promise.all(updatePromises);

      if (results.every((result) => result.success)) {
        setStatus({
          type: "success",
          message: "Equipment rates updated successfully",
        });
        router.refresh();
        form.reset();
      } else {
        setStatus({
          type: "error",
          message: "Failed to update some equipment rates",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "An error occurred while updating rates",
      });
    } finally {
      setIsSubmitting(false);
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

        <div className="grid gap-6">
          {initialRates.map((equipment) => (
            <FormField
              key={equipment._id}
              control={form.control}
              name={equipment._id}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{equipment.name}</FormLabel>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground w-40">
                      Current Rate: Rs {equipment.rate.toLocaleString()}
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter new rate"
                        {...field}
                        className="max-w-[200px]"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isDirty}
        >
          {isSubmitting ? "Updating..." : "Update Rates"}
        </Button>
      </form>
    </Form>
  );
}
