"use client";

import { addTractorExpense } from "@/lib/actions/tractor-expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useActionState } from "react";

export default function AddTractorExpenseForm({
  tractorId,
}: {
  tractorId: string;
}) {
  const initialState = { success: false, message: "" };
  const [state, formAction, loading] = useActionState(
    addTractorExpense,
    initialState
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tractorId" value={tractorId} />

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Enter expense description"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
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

          {state.message && (
            <p className={`text-${state.success ? "green" : "red"}-600`}>
              {state.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
