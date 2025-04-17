// edit-dialog.tsx
"use client";

import { useState } from "react";
import { useForm, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type FieldType = "text" | "number" | "date" | "textarea" | "select";

interface Field<TFormValues> {
  name: Path<TFormValues>;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[]; // Add this for select fields
}

interface EditDialogProps<TSchema extends z.ZodType> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<TSchema>) => Promise<void>;
  title: string;
  initialData: z.infer<TSchema>;
  schema: TSchema;
  fields: Field<z.infer<TSchema>>[];
  onFieldChange?: (fieldName: string, value: any) => void; // Add this prop
}

export default function EditDialog<TSchema extends z.ZodType>({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  schema,
  fields,
  onFieldChange,
}: EditDialogProps<TSchema>) {
  const [isLoading, setIsLoading] = useState(false);

  type FormData = z.infer<TSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const handleSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field changes and notify parent component
  const handleFieldChange = (fieldName: string, value: any) => {
    if (onFieldChange) {
      onFieldChange(fieldName, value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === "select" ? (
                        <Select
                          onValueChange={(value) => {
                            formField.onChange(value);
                            handleFieldChange(field.name as string, value);
                          }}
                          defaultValue={formField.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          {...formField}
                          onChange={(e) => {
                            formField.onChange(e);
                            handleFieldChange(
                              field.name as string,
                              e.target.value
                            );
                          }}
                          disabled={isLoading}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          {...formField}
                          onChange={(e) => {
                            formField.onChange(e);
                            handleFieldChange(
                              field.name as string,
                              e.target.value
                            );
                          }}
                          disabled={isLoading}
                          placeholder={field.placeholder}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
