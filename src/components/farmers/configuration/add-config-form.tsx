"use client";

import { createFarmerConfig } from "@/lib/newActions/farmerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Saving..." : "Save Configuration"}
    </Button>
  );
}

export default function AddFarmerConfigForm() {
  async function clientAction(formData: FormData) {
    const name = formData.get("name") as string;
    const baseSharePercentage = Number(formData.get("baseSharePercentage"));

    await createFarmerConfig({
      name,
      baseSharePercentage,
      expenseConfigs: [],
    });
  }

  return (
    <form action={clientAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Configuration Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. 50% Share Partner"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="baseSharePercentage">Base Farmer Share (%)</Label>
        <Input
          id="baseSharePercentage"
          name="baseSharePercentage"
          type="number"
          min="0"
          max="100"
          defaultValue="50"
          required
        />
      </div>

      <SubmitButton />
    </form>
  );
}
