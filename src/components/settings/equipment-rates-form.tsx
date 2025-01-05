"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEquipmentRate } from "@/lib/actions/equipment-rate";
import { useRouter } from "next/navigation";

interface EquipmentRate {
  _id: string;
  name: string;
  rate: number;
}

interface EquipmentRatesFormProps {
  initialRates: EquipmentRate[];
}

export default function EquipmentRatesForm({
  initialRates,
}: EquipmentRatesFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create a state object for new rates
  const [newRates, setNewRates] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Update only the rates that have been changed
      const updatePromises = Object.entries(newRates).map(([id, rateStr]) => {
        const rate = Number(rateStr);
        if (rate > 0) {
          return updateEquipmentRate(id, rate);
        }
        return Promise.resolve({ success: true });
      });

      const results = await Promise.all(updatePromises);

      if (results.every((result) => result.success)) {
        setSuccess("Equipment rates updated successfully");
        router.refresh(); // Refresh the page to show updated rates
      } else {
        setError("Failed to update some equipment rates");
      }
    } catch (err) {
      setError("An error occurred while updating rates");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRateChange = (id: string, value: string) => {
    setNewRates((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {initialRates.map((equipment) => (
          <div key={equipment._id} className="flex flex-col space-y-2">
            <Label htmlFor={equipment._id}>{equipment.name}</Label>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground w-40">
                Current Rate: Rs {equipment.rate.toLocaleString()}
              </div>
              <Input
                id={equipment._id}
                type="number"
                placeholder="Enter new rate"
                value={newRates[equipment._id] || ""}
                onChange={(e) =>
                  handleRateChange(equipment._id, e.target.value)
                }
                className="max-w-[200px]"
              />
            </div>
          </div>
        ))}
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {success && <div className="text-sm text-green-500">{success}</div>}

      <Button
        type="submit"
        disabled={isSubmitting || Object.keys(newRates).length === 0}
      >
        {isSubmitting ? "Updating..." : "Update Rates"}
      </Button>
    </form>
  );
}
