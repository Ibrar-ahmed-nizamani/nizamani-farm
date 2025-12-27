"use client";

import { createExpenseCategory, deleteExpenseCategory } from "@/lib/newActions/expenseCategoryActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Check, ChevronsUpDown, Loader2, X } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

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

export default function ExpenseCategoryManager({ categories }: { categories: (Omit<ExpenseCategory, "_id" | "createdAt"> & { _id: string, createdAt?: string | Date })[] }) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("")
  const [isPending, startTransition] = React.useTransition();

  const { register, handleSubmit, setValue, watch, setError, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      name: "",
    },
  });

  const categoryValue = watch("category");

  // Get unique categories for the dropdown
  const existingCategories = React.useMemo(() => {
    return Array.from(new Set(categories.map(c => c.category))).sort();
  }, [categories]);

  // Group categories for the table
  const groupedCategories = React.useMemo(() => {
    const groups: Record<string, typeof categories> = {};
    categories.forEach(cat => {
        if (!groups[cat.category]) {
            groups[cat.category] = [];
        }
        groups[cat.category].push(cat);
    });
    // Sort items within groups if needed, currently they are roughly insertion order or DB sort
    return groups;
  }, [categories]);

  async function onSubmit(data: FormValues) {
    startTransition(async () => {
        const formData = new FormData();
        formData.append("category", data.category);
        formData.append("name", data.name);

        const result = await createExpenseCategory(null, formData);

        if (result?.errors) {
            if (result.errors.category) {
                setError("category", { message: result.errors.category[0] });
            }
            if (result.errors.name) {
                setError("name", { message: result.errors.name[0] });
            }
        } else if (result?.success) {
            reset();
            setInputValue("");
        }
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="p-6 border rounded-lg bg-card h-fit">
        <h2 className="text-xl font-semibold mb-4">Add Expense Category</h2>
        <p className="text-muted-foreground mb-4">
          Define global expense types (e.g., Fertilizer - DAP)
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="category">Category</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn("w-full justify-between", !categoryValue && "text-muted-foreground")}
                >
                  {categoryValue || "Select or type category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
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
                                    setValue("category", inputValue, { shouldValidate: true });
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
                             // cmdk might lowercase values, so better to rely on our original list or explicit assignment if needed.
                             // But since we rendered 'value={category}', usually it passes that back.
                             // Careful: cmdk 'value' prop is usually for filtering, onSelect passes the *value*.
                             // If logic is tricky, just use the closure 'category' variable.
                            setValue("category", category, { shouldValidate: true });
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              categoryValue === category ? "opacity-100" : "opacity-0"
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
            {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
                id="name" 
                placeholder="e.g. DAP" 
                {...register("name")}
            />
             {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </>
            )}
            </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Categories</h2>
        {Object.keys(groupedCategories).length > 0 ? (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Category</TableHead>
                <TableHead>Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedCategories).map(([categoryName, items]) => (
                <TableRow key={categoryName}>
                  <TableCell className="font-medium align-top py-4">{categoryName}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-2">
                        {items.map((cat) => (
                            <Badge  key={cat._id} variant="secondary" className="pr-1 py-1 text-base">
                                {cat.name}
                                <form action={deleteExpenseCategory.bind(null, cat._id)} className="ml-2">
                                    <button 
                                        type="submit" 
                                        className="hover:bg-destructive/20 p-0.5 rounded-full transition-colors text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-3 h-3" />
                                        <span className="sr-only">Delete {cat.name}</span>
                                    </button>
                                </form>
                            </Badge>
                        ))}
                    </div>
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
