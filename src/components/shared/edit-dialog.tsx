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

type FieldType = "text" | "number" | "date" | "textarea";

interface Field<TFormValues> {
  name: Path<TFormValues>;
  label: string;
  type: FieldType;
  placeholder?: string;
}

interface EditDialogProps<TSchema extends z.ZodType> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<TSchema>) => Promise<void>;
  title: string;
  initialData: z.infer<TSchema>;
  schema: TSchema;
  fields: Field<z.infer<TSchema>>[];
}

export default function EditDialog<TSchema extends z.ZodType>({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  schema,
  fields,
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
                      {field.type === "textarea" ? (
                        <Textarea
                          {...formField}
                          disabled={isLoading}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          {...formField}
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
