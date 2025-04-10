// app/fields/[fieldId]/farmers/[farmerId]/add-transaction/add-transaction-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addFieldExpense } from "@/lib/actions/field";

// Define the form schema with Zod
const formSchema = z.object({
  type: z.enum(["expense", "income"]),
  expenseType: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date(),
  description: z.string().min(1, "Description is required"),
});

// Define the expense type interface
interface ExpenseType {
  _id: string;
  name: string;
  farmerExpenseSharePercentage: number;
  shareType: string;
}

export default function AddTransactionForm({
  fieldId,
  farmerId,
  expenseTypes,
}: {
  fieldId: string;
  farmerId: string;
  expenseTypes: ExpenseType[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"expense" | "income">(
    "expense"
  );
  // const [selectedExpenseType, setSelectedExpenseType] = useState<string | null>(
  //   null
  // );
  const [farmerShare, setFarmerShare] = useState<number | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: 0, // Initialize with 0 instead of undefined
      date: new Date(),
      description: "",
    },
  });

  // Handle expense type change
  const handleExpenseTypeChange = (value: string) => {
    // setSelectedExpenseType(value);
    const expenseType = expenseTypes.find((et) => et._id === value);
    if (expenseType) {
      setFarmerShare(expenseType.farmerExpenseSharePercentage);
    } else {
      setFarmerShare(null);
    }
  };

  // Handle transaction type change
  const handleTypeChange = (value: "expense" | "income") => {
    setSelectedType(value);
    form.setValue("type", value);

    // Reset expense type if changed to income
    if (value === "income") {
      form.setValue("expenseType", undefined);
      // setSelectedExpenseType(null);
      setFarmerShare(null);
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Add field expense/income
      await addFieldExpense(fieldId, farmerId, {
        type: values.type,
        expenseType: values.expenseType,
        amount: values.amount,
        date: values.date,
        description: values.description,
        farmerShare: farmerShare !== null ? farmerShare : 0,
      });

      // Redirect back to farmer page
      router.push(`/fields/${fieldId}/farmers/${farmerId}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select
                onValueChange={(value: "expense" | "income") =>
                  handleTypeChange(value)
                }
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Expense Type - Only show if transaction type is expense */}
        {selectedType === "expense" && (
          <FormField
            control={form.control}
            name="expenseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleExpenseTypeChange(value);
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name} ({type.farmerExpenseSharePercentage}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {farmerShare !== null && (
                  <FormDescription>
                    Farmer will pay {farmerShare}% of this expense
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Rs)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ""} // Handle empty state properly
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : parseFloat(value));
                  }}
                  placeholder="Enter amount"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
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
                        "pl-3 text-left font-normal",
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter details about the transaction"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Add Transaction"}
        </Button>
      </form>
    </Form>
  );
}
