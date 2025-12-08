"use client";

import { addExpenseToConfig } from "@/lib/newActions/farmerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { ExpenseCategory } from "@/lib/types/ExpenseCategory";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      <Plus className="w-4 h-4 mr-2" />
      {pending ? "Adding..." : "Add Override"}
    </Button>
  );
}

export default function AddConfigExpenseForm({ configId, categories }: { configId: string, categories: (Omit<ExpenseCategory, "_id"> & { _id: string })[] }) {
  const [farmerShare, setFarmerShare] = useState(50);
  const [ownerShare, setOwnerShare] = useState(50);

  const handleShareChange = (val: number) => {
    setFarmerShare(val);
    setOwnerShare(100 - val);
  };

  async function clientAction(formData: FormData) {
    const categoryId = formData.get("categoryId") as string;
    
    // Find category name for denormalization
    const category = categories.find(c => c._id === categoryId);
    if (!category) return;

    await addExpenseToConfig(configId, {
        categoryId,
        category: category.category,
        itemName: category.name,
        farmerShare,
        ownerShare
    });
    
    // Reset defaults
    setFarmerShare(50);
    setOwnerShare(50);
  }

  if (categories.length === 0) {
      return <div className="text-muted-foreground">All available categories are already assigned.</div>
  }

  return (
    <form action={clientAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categoryId">Expense Category</Label>
        <Select name="categoryId" required>
            <SelectTrigger>
                <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(
                    categories.reduce((acc, cat) => {
                        const group = cat.category;
                        if (!acc[group]) acc[group] = [];
                        acc[group].push(cat);
                        return acc;
                    }, {} as Record<string, typeof categories>)
                ).map(([groupName, groupCategories]) => (
                    <SelectGroup key={groupName}>
                        <SelectLabel>{groupName}</SelectLabel>
                        {groupCategories.map(cat => (
                            <SelectItem className="px-6" key={cat._id} value={cat._id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="farmerShare">Farmer Share (%)</Label>
            <Input
                id="farmerShare"
                name="farmerShare"
                type="number"
                min="0"
                max="100"
                value={farmerShare}
                onChange={(e) => handleShareChange(Number(e.target.value))}
                required
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="ownerShare">Owner Share (%)</Label>
            <Input
                id="ownerShare"
                name="ownerShare"
                type="number"
                value={ownerShare}
                readOnly
                className="bg-muted"
            />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
