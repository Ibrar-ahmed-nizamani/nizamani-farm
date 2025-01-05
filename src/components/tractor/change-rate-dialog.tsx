"use client";

import { useState } from "react";
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
import { updateEquipmentRate } from "@/lib/actions/equipment-rate";

interface ChangeRateDialogProps {
  equipmentId: string;
  equipmentName: string;
  currentRate: number;
  onRateUpdate: () => void;
}

export default function ChangeRateDialog({
  equipmentId,
  equipmentName,
  currentRate,
  onRateUpdate,
}: ChangeRateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRate, setNewRate] = useState(currentRate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await updateEquipmentRate(equipmentId, newRate);

    if (result.success) {
      onRateUpdate();
      setIsOpen(false);
    } else {
      setError(result.error || "Failed to update rate");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change Rate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Equipment Rate</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label>Equipment</Label>
            <div className="text-sm text-gray-500">{equipmentName}</div>
          </div>
          <div className="space-y-2">
            <Label>Current Rate</Label>
            <div className="text-sm text-gray-500">
              Rs {currentRate.toLocaleString()}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newRate">New Rate</Label>
            <Input
              id="newRate"
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(Number(e.target.value))}
              min={0}
              required
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? "Updating..." : "Update Rate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
