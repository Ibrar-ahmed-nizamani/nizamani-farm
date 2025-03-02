// app/fields/[id]/expenses/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// import { toast } from "@/components/ui/use-toast";
import { addFieldExpense } from "@/lib/actions/field";
import { getShareSettings } from "@/lib/actions/share-settings";

interface ExpenseFormValues {
  amount: number;
  description: string;
  date: Date;
  expenseTypeId?: string;
}

interface ExpenseType {
  id: string;
  name: string;
}

export default function AddFieldExpensePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);

  useEffect(() => {
    async function fetchExpenseTypes() {
      try {
        // We can extract unique expense types from share settings
        const settings = await getShareSettings();
        const uniqueExpenseTypeIds = new Set<string>();
        settings.forEach((setting) => {
          setting.expenseAllocations.forEach((allocation) => {
            uniqueExpenseTypeIds.add(allocation.expenseTypeId);
          });
        });

        // Mapping of known expense type IDs to names
        const knownTypes: Record<string, string> = {
          tractor: "Tractor Expenses",
          cultivator: "Cultivator Expenses",
          seeds: "Seeds",
          fertilizer: "Fertilizer",
          pesticides: "Pesticides",
          irrigation: "Irrigation",
        };

        const expenseTypesArray = Array.from(uniqueExpenseTypeIds).map(
          (id) => ({
            id,
            name: knownTypes[id] || id,
          })
        );

        setExpenseTypes(expenseTypesArray);
      } catch (error) {
        console.error("Failed to fetch expense types:", error);
        // toast({
        //   title: "Error",
        //   description: "Failed to load expense types",
        //   variant: "destructive",
        // });
      }
    }

    fetchExpenseTypes();
  }, []);

  const form = useForm<ExpenseFormValues>({
    defaultValues: {
      amount: 0,
      description: "",
      date: new Date(),
    },
  });

  const onSubmit = async (values: ExpenseFormValues) => {
    setLoading(true);
    try {
      const result = await addFieldExpense(
        params.id,
        values.amount,
        values.description,
        values.date,
        values.expenseTypeId // Pass the expense type ID to the server action
      );

      if (result.success) {
        // toast({
        //   title: "Success",
        //   description: "Expense added successfully",
        // });
        router.push(`/fields/${params.id}`);
      } else {
        // toast({
        //   title: "Error",
        //   description: result.error || "Failed to add expense",
        //   variant: "destructive",
        // });
      }
    } catch (error) {
      console.error("Failed to add expense:", error);
      //   toast({
      //     title: "Error",
      //     description: "Something went wrong",
      //     variant: "destructive",
      //   });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Add Field Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expenseTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Type</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Select expense type (optional)</option>
                        {expenseTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
