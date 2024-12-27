"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addTransaction } from "@/lib/actions/transaction";
import { useActionState } from "react";

const initialState = {
  success: false,
  message: "",
};

export default function AddTransactionForm({
  customerId,
}: {
  customerId: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    addTransaction,
    initialState
  );

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="customerId" value={customerId} />

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder="Enter transaction description"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            {state.success === false ? (
              <p className="text-sm text-red-500">{state.message}</p>
            ) : null}
            {state.success && (
              <p className="text-sm text-green-500">{state.message}</p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              Add Transaction
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <Button variant="link" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
