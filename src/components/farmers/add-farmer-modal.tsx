"use client";

import { createFarmer } from "@/lib/newActions/farmerActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { FarmerConfig } from "@/lib/types/FarmerModel";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Adding..." : "Add Farmer"}
    </Button>
  );
}

export default function AddFarmerModal({ configs }: { configs: (Omit<FarmerConfig, "_id"> & { _id: string })[] }) {
  const [open, setOpen] = useState(false);

  async function clientAction(formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const cnic = formData.get("cnic") as string;
    const result = await createFarmer({
      name,
      phone,
      cnic,
    });

    if (result.success) {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Farmer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Farmer</DialogTitle>
          <DialogDescription>
            Create a new farmer profile. You can assign them to fields later.
          </DialogDescription>
        </DialogHeader>
        <form action={clientAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input id="phone" name="phone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnic">CNIC (Optional)</Label>
            <Input id="cnic" name="cnic" />
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
