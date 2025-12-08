"use client";

import { createExpenseCategory, deleteExpenseCategory } from "@/lib/newActions/expenseCategoryActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Check, ChevronsUpDown } from "lucide-react";
import { useFormStatus } from "react-dom";
import { ExpenseCategory } from "@/lib/types/ExpenseCategory";
import EmptyState from "@/components/shared/empty-state";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Plus className="w-4 h-4 mr-2" />
      {pending ? "Adding..." : "Add Category"}
    </Button>
  );
}

function DeleteButton({ id }: { id: string }) {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            disabled={pending}
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    )
}

export default function ExpenseCategoryManager({ categories }: { categories: (Omit<ExpenseCategory, "_id"> & { _id: string })[] }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("")

  // Get unique categories for the dropdown
  const existingCategories = Array.from(new Set(categories.map(c => c.category))).sort();

  async function clientAction(formData: FormData) {
    const category = formData.get("category") as string;
    const name = formData.get("name") as string;

    await createExpenseCategory({
      category,
      name,
    });
    
    // Reset form state if needed, though server action revalidation might handle some UI updates
    setValue("");
    setInputValue("");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="p-6 border rounded-lg bg-card h-fit">
        <h2 className="text-xl font-semibold mb-4">Add Expense Category</h2>
        <p className="text-muted-foreground mb-4">
          Define global expense types (e.g., Fertilizer - DAP)
        </p>
        <form action={clientAction} className="space-y-4">
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="category">Category</Label>
            <input type="hidden" name="category" value={value} />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {value
                    ? value
                    : "Select or type category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                    {/* 
                        We capture the search input to allow creating new categories. 
                        Note: CommandInput doesn't expose its value directly in a simple way for 'controlled' input w/o deeper integration, 
                        but we can use onValueChange of CommandInput if we really needed full control. 
                        However, cmdk handles filtering. We mostly care about the 'Create' case.
                    */}
                  <CommandInput 
                    placeholder="Search category..." 
                    value={inputValue}
                    onValueChange={setInputValue}
                  />
                  <CommandList>
                    <CommandEmpty>
                        <div className="p-2">
                             <p className="text-sm text-muted-foreground mb-2">No category found.</p>
                             <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-full justify-start h-auto py-1 px-2"
                                onClick={() => {
                                    setValue(inputValue);
                                    setOpen(false);
                                }}
                                type="button"
                             >
                                <Plus className="mr-2 h-3 w-3" />
                                Create "{inputValue}"
                             </Button>
                        </div>
                    </CommandEmpty>
                    <CommandGroup heading="Existing Categories">
                      {existingCategories.map((category) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={(currentValue) => {
                            // currentValue is lowercased by default by cmdk, so we use the original category string if it matches
                            // But here 'category' variable is the display name. 
                            // cmdk passes the `value` prop or the text content if value not provided.
                            setValue(category);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === category ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="e.g. DAP" required />
          </div>
          <SubmitButton />
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Categories</h2>
        {categories.length > 0 ? (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell>{cat.category}</TableCell>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell className="text-right">
                    <form action={deleteExpenseCategory.bind(null, cat._id)}>
                        <DeleteButton id={cat._id} />
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No categories found"
            description="Add your first expense category"
          />
        )}
      </div>
    </div>
  );
}
