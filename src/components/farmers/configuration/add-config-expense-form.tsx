"use client";

import { addExpenseToConfig, addMultipleExpensesToConfig } from "@/lib/newActions/farmerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { ExpenseCategory } from "@/lib/types/ExpenseCategory";

interface AddConfigExpenseFormProps {
  configId: string;
  categories: (Omit<ExpenseCategory, "_id" | "createdAt"> & { _id: string, createdAt?: string | Date })[];
  categoryGroups: string[];
}

export default function AddConfigExpenseForm({ configId, categories, categoryGroups }: AddConfigExpenseFormProps) {
  const [farmerShare, setFarmerShare] = useState(50);
  const [ownerShare, setOwnerShare] = useState(50);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleShareChange = (val: number) => {
    setFarmerShare(val);
    setOwnerShare(100 - val);
  };

  const handleAddSingleItem = () => {
    if (!selectedCategoryId) return;
    
    const category = categories.find(c => c._id === selectedCategoryId);
    if (!category) return;

    startTransition(async () => {
      await addExpenseToConfig(configId, {
        categoryId: selectedCategoryId,
        category: category.category,
        itemName: category.name,
        farmerShare,
        ownerShare
      });
      
      // Reset
      setSelectedCategoryId("");
      setFarmerShare(50);
      setOwnerShare(50);
    });
  };

  const handleAddEntireCategory = () => {
    if (!selectedGroup) return;
    
    // Get all items in this category group
    const itemsInGroup = categories.filter(c => c.category === selectedGroup);
    if (itemsInGroup.length === 0) return;

    const expenseConfigs = itemsInGroup.map(item => ({
      categoryId: item._id,
      category: item.category,
      itemName: item.name,
      farmerShare,
      ownerShare
    }));

    startTransition(async () => {
      await addMultipleExpensesToConfig(configId, expenseConfigs);
      
      // Reset
      setSelectedGroup("");
      setFarmerShare(50);
      setOwnerShare(50);
    });
  };

  if (categories.length === 0) {
    return <div className="text-muted-foreground">All available categories are already assigned.</div>;
  }

  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="single">Single Item</TabsTrigger>
        <TabsTrigger value="category">Entire Category</TabsTrigger>
      </TabsList>

      <TabsContent value="single" className="space-y-4">
        <div className="space-y-2">
          <Label>Expense Item</Label>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Item" />
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
                    <SelectItem className="pl-6" key={cat._id} value={cat._id}>
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
            <Label>Farmer Share (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={farmerShare}
              onChange={(e) => handleShareChange(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Owner Share (%)</Label>
            <Input
              type="number"
              value={ownerShare}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <Button 
          onClick={handleAddSingleItem} 
          disabled={!selectedCategoryId || isPending}
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {isPending ? "Adding..." : "Add Override"}
        </Button>
      </TabsContent>

      <TabsContent value="category" className="space-y-4">
        <div className="space-y-2">
          <Label>Category Group</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryGroups.map(group => {
                const itemCount = categories.filter(c => c.category === group).length;
                return (
                  <SelectItem key={group} value={group}>
                    {group} ({itemCount} items)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedGroup && (
            <p className="text-sm text-muted-foreground">
              This will add all {categories.filter(c => c.category === selectedGroup).length} items 
              from "{selectedGroup}" with the same share percentage.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Farmer Share (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={farmerShare}
              onChange={(e) => handleShareChange(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Owner Share (%)</Label>
            <Input
              type="number"
              value={ownerShare}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <Button 
          onClick={handleAddEntireCategory} 
          disabled={!selectedGroup || isPending}
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {isPending ? "Adding..." : `Add All Items from ${selectedGroup || "Category"}`}
        </Button>
      </TabsContent>
    </Tabs>
  );
}
