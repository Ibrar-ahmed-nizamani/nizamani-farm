"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil } from "lucide-react";
import { updateFarmer } from "@/lib/actions/farmer";
import StatusAlert from "@/components/ui/status-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  fieldId: string;
  farmerId: string;
  farmerName: string;
  shareType: number;
  allocatedArea: number;
  maxArea: number;
}

const formSchema = z.object({
  farmerName: z.string().min(1, "Farmer name is required"),
  shareType: z.enum(["1/3", "1/2", "1/4"]),
  allocatedArea: z
    .string()
    .transform((val) => (val === "" ? 0 : Number(val)))
    .pipe(z.number().min(0.01, "Must be a valid positive number")),
});

type FormValues = {
  farmerName: string;
  shareType: number;
  allocatedArea: string;
};

export default function EditFarmerDialog({
  fieldId,
  farmerId,
  farmerName,
  shareType,
  allocatedArea,
  maxArea,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmerName,
      shareType,
      allocatedArea: allocatedArea.toString(),
    },
  });

  const onSubmit = async (values: FormValues) => {
    const newAllocatedArea = parseFloat(values.allocatedArea);

    // Check if the allocated area is valid based on current allocation
    const availableArea = maxArea + allocatedArea;
    if (newAllocatedArea > availableArea) {
      setStatus({
        type: "error",
        message: `Allocated area cannot exceed ${availableArea.toFixed(
          2
        )} acres`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateFarmer(
        fieldId,
        farmerId,
        values.farmerName,
        values.shareType,
        newAllocatedArea
      );

      if (result.success) {
        setStatus({
          type: "success",
          message: "Farmer updated successfully",
        });
        setTimeout(() => {
          setOpen(false);
          setStatus({ type: null, message: null });
        }, 1500);
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to update farmer",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Farmer</DialogTitle>
          <DialogDescription>Remaining Area: {maxArea} Acres</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {status.type && (
              <StatusAlert
                status={{ message: status.message, type: status.type }}
              />
            )}

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="farmerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farmer Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Enter farmer name"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shareType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Share Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select share type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1/2">50%</SelectItem>
                        <SelectItem value="1/3">One Third (1/3)</SelectItem>
                        <SelectItem value="1/4">25%</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allocatedArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocated Area (Acres)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
                  "Update Farmer"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
