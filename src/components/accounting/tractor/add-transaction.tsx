// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { addTransaction } from "@/lib/actions/transaction";
// import { useActionState } from "react";

// const initialState = {
//   success: false,
//   message: "",
// };

// export default function AddTransactionForm({
//   customerId,
// }: {
//   customerId: string;
// }) {
//   const router = useRouter();
//   const [state, formAction, pending] = useActionState(
//     addTransaction,
//     initialState
//   );

//   return (
//     <div className="container mx-auto p-4">
//       <Card className="max-w-md mx-auto">
//         <CardHeader>
//           <CardTitle>Add New Transaction</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form action={formAction} className="space-y-4">
//             <input type="hidden" name="customerId" value={customerId} />

//             <div>
//               <Label htmlFor="description">Description</Label>
//               <Input
//                 id="description"
//                 name="description"
//                 type="text"
//                 placeholder="Enter transaction description"
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="amount">Amount</Label>
//               <Input
//                 id="amount"
//                 name="amount"
//                 type="number"
//                 placeholder="Enter amount"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="date">Date</Label>
//               <Input
//                 id="date"
//                 name="date"
//                 type="date"
//                 required
//                 defaultValue={new Date().toISOString().split("T")[0]}
//               />
//             </div>

//             {state.success === false ? (
//               <p className="text-sm text-red-500">{state.message}</p>
//             ) : null}
//             {state.success && (
//               <p className="text-sm text-green-500">{state.message}</p>
//             )}

//             <Button type="submit" disabled={pending} className="w-full">
//               Add Transaction
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//       <div className="mt-4 text-center">
//         <Button variant="link" onClick={() => router.back()}>
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// }

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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { addTransaction } from "@/lib/actions/transaction";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(["DEBIT", "CREDIT"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Must be a valid positive number"),
  description: z.string().min(1, "Description is required"),
});

// Define the shape of the form values (before transformation)
type FormInput = {
  date: string;
  type: "DEBIT" | "CREDIT";
  amount: string;
  description: string;
};

interface Props {
  customerId: string;
}

export default function CustomerTransactionForm({ customerId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "CREDIT",
      amount: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("customerId", customerId);
      formData.append("date", values.date);
      formData.append("type", values.type);
      formData.append("amount", values.amount);
      formData.append("description", values.description);

      // The server action will handle redirect on success
      const result = await addTransaction(null, formData);

      if (result && !result.success) {
        setError(result.message || "Failed to add transaction");
      }
    } catch {
      setError("An error occurred while adding the transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (Rs)</FormLabel>
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Transaction...
              </>
            ) : (
              "Add Transaction"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
