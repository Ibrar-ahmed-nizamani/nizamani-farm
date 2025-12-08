"use client";

import { createFarmerConfig } from "@/lib/newActions/farmerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Trash2 } from "lucide-react";
import { ExpenseCategory } from "@/lib/types/ExpenseCategory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Saving..." : "Save Configuration"}
    </Button>
  );
}

export default function AddFarmerConfigForm({ categories }: { categories: (Omit<ExpenseCategory, "_id"> & { _id: string })[] }) {
  const [expenseConfigs, setExpenseConfigs] = useState<
    { categoryId: string; category: string; itemName: string; farmerShare: number; ownerShare: number }[]
  >([]);

  const addExpenseConfig = () => {
    setExpenseConfigs([
      ...expenseConfigs,
      { categoryId: "", category: "", itemName: "", farmerShare: 50, ownerShare: 50 },
    ]);
  };

  const removeExpenseConfig = (index: number) => {
    const newConfigs = [...expenseConfigs];
    newConfigs.splice(index, 1);
    setExpenseConfigs(newConfigs);
  };

  const updateExpenseConfig = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newConfigs = [...expenseConfigs];
    // @ts-ignore
    newConfigs[index][field] = value;
    
    if (field === "categoryId") {
        const selectedCat = categories.find(c => c._id === value);
        if (selectedCat) {
            newConfigs[index].category = selectedCat.category;
            newConfigs[index].itemName = selectedCat.name;
        }
    }

    if (field === "farmerShare") {
      newConfigs[index].ownerShare = 100 - Number(value);
    }
    setExpenseConfigs(newConfigs);
  };

  async function clientAction(formData: FormData) {
    const name = formData.get("name") as string;
    const baseSharePercentage = Number(formData.get("baseSharePercentage"));

    const result = await createFarmerConfig({
      name,
      baseSharePercentage,
      expenseConfigs,
    });

    if (result.success) {
      setExpenseConfigs([]);
    }
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

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Expense Overrides (Optional)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExpenseConfig}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Override
          </Button>
        </div>
        
        {expenseConfigs.length === 0 && (
            <p className="text-sm text-muted-foreground">No overrides. All expenses will follow the base share or default logic.</p>
        )}

        <div className="space-y-3">
          {expenseConfigs.map((config, index) => (
            <div key={index} className="flex gap-2 items-end border p-2 rounded bg-muted/20">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Category</Label>
                <Select
                    value={config.categoryId}
                    onValueChange={(val) => updateExpenseConfig(index, "categoryId", val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat._id} value={cat._id}>
                                {cat.category} - {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Farmer %</Label>
                <Input
                  type="number"
                  value={config.farmerShare}
                  onChange={(e) =>
                    updateExpenseConfig(index, "farmerShare", Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Owner %</Label>
                <Input
                  type="number"
                  value={config.ownerShare}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeExpenseConfig(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
