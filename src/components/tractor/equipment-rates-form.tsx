"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEquipmentRates } from "@/lib/actions";

type EquipmentRate = {
  name: string;
  rate: number;
};

// Dummy data for previous rates
const previousRates: EquipmentRate[] = [
  { name: "Cultivator", rate: 100 },
  { name: "Raja", rate: 150 },
  { name: "Laser", rate: 200 },
  { name: "Gobal", rate: 180 },
  { name: "Blade", rate: 120 },
];

export function EquipmentRateForm() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    const result = await updateEquipmentRates(formData);
    if (result.success) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Update Equipment Rates</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Equipment Rates</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          {previousRates.map((equipment) => (
            <div
              key={equipment.name}
              className="grid grid-cols-3 items-center gap-10"
            >
              <Label htmlFor={equipment.name} className="text-right text-base">
                {equipment.name}
              </Label>
              <div className="col-span-2 flex items-center gap-5">
                <span className=" text-muted-foreground">
                  Previous {equipment.rate}
                </span>
                <Input
                  id={equipment.name}
                  name={equipment.name}
                  placeholder="New rate"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
          ))}
          <Button type="submit" className="w-full">
            Update Rates
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
