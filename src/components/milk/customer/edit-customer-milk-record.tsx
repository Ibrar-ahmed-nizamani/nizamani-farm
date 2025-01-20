// edit-milk-record.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { Path } from "react-hook-form";
import { updateMilkRecord } from "@/lib/actions/milk-customer-actions";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/shared/edit-dialog";

// Define the schema with proper types - matching add-customer-milk-form validation
const editMilkRecordSchema = z.object({
  date: z.string().min(1, "Date is required"),
  quantity: z.coerce.number().positive("Must be a valid positive number"),
  price: z.coerce.number().positive("Must be a valid positive number"),
});

type EditMilkRecordFormData = z.infer<typeof editMilkRecordSchema>;

interface MilkRecord {
  _id: string;
  date: string;
  quantity: number;
  price: number;
}

interface EditMilkRecordProps {
  customerId: string;
  record: MilkRecord;
}

export function EditMilkRecord({ customerId, record }: EditMilkRecordProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: EditMilkRecordFormData) => {
    await updateMilkRecord(
      customerId,
      record._id,
      values.quantity,
      values.price,
      new Date(values.date)
    );
  };

  const fields: Array<{
    name: Path<EditMilkRecordFormData>;
    label: string;
    type: "text" | "number" | "date";
    placeholder?: string;
  }> = [
    {
      name: "date",
      label: "Date",
      type: "date",
      placeholder: "Select date",
    },
    {
      name: "quantity",
      label: "Quantity (L)",
      type: "number",
      placeholder: "Enter quantity",
    },
    {
      name: "price",
      label: "Price (Rs)",
      type: "number",
      placeholder: "Enter price",
    },
  ];

  const initialData: EditMilkRecordFormData = {
    date: record.date.split("T")[0],
    quantity: record.quantity,
    price: record.price,
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <PencilIcon className="h-4 w-4" />
      </Button>

      <EditDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="Edit Milk Record"
        initialData={initialData}
        schema={editMilkRecordSchema}
        fields={fields}
      />
    </>
  );
}
