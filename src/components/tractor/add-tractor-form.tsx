"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { addTractor } from "@/lib/actions/tractor";
import FormActionButton from "../ui/formAction-button";

export default function AddTractorForm() {
  const [state, formAction] = useActionState(addTractor, { error: "" });

  return (
    <form action={formAction} className="space-y-5 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="tractorName">Tractor Name</Label>
        <Input id="tractorName" name="tractorName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tractorModel">Model</Label>
        <Input id="tractorModel" name="tractorModel" required />
      </div>
      {state?.error && <p className="text-destructive">{state.error}</p>}
      <FormActionButton>Save Tractor</FormActionButton>
    </form>
  );
}
