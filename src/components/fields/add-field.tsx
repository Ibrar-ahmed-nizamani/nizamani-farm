// components/fields/add-field-form.tsx
"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { addField, getExistingFieldNames } from "@/lib/actions/NewField";
import StatusAlert from "@/components/ui/status-alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  year: z.string().min(1, "Year is required"),
  totalArea: z
    .string()
    .min(1, "Area is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Must be a valid positive number"),
  // location: z.string().min(2, "Location must be at least 2 characters").trim(),
});

// Generate year options from 2020 to current year
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2020; year--) {
    years.push(year);
  }
  return years;
};

export default function AddFieldForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [existingFieldNames, setExistingFieldNames] = useState<string[]>([]);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear().toString(),
      totalArea: 0,
      // location: "",
    },
  });

  const yearOptions = generateYearOptions();

  // Fetch existing field names on component mount
  useEffect(() => {
    const fetchExistingNames = async () => {
      try {
        const names = await getExistingFieldNames();
        setExistingFieldNames(names);
      } catch (error) {
        console.error("Failed to fetch existing field names:", error);
      }
    };
    fetchExistingNames();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await addField(
        values.name,
        parseInt(values.year),
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
                {existingFieldNames.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Existing fields: {existingFieldNames.join(", ")}
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
