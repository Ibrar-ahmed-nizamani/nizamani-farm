// edit-milk-record.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { Path } from "react-hook-form";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/shared/edit-dialog";
import { updateMilkRecord } from "@/lib/actions/milk";

// Define the schema with proper types - matching add-customer-milk-form validation
const editMilkRecordSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amMilk: z.coerce.number().positive("Must be a valid positive number"),
  pmMilk: z.coerce.number().positive("Must be a valid positive number"),
});

type EditMilkRecordFormData = z.infer<typeof editMilkRecordSchema>;

interface MilkRecord {
  date: string;
  amMilk: number;
  pmMilk: number;
}

interface EditMilkRecordProps {
  recordId: string;
  record: MilkRecord;
}

export function EditMilkRecord({ recordId, record }: EditMilkRecordProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: EditMilkRecordFormData) => {
    await updateMilkRecord(recordId, {
      date: new Date(values.date),
      amMilk: values.amMilk,
      pmMilk: values.pmMilk,
    });
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
      name: "amMilk",
      label: "Morning Milk (L)",
      type: "number",
      placeholder: "Enter Morning Milk",
    },
    {
      name: "pmMilk",
      label: "Evening Milk (L)",
      type: "number",
      placeholder: "Enter Evening Milk",
    },
  ];

  const initialData: EditMilkRecordFormData = {
    date: record.date.split("T")[0],
    amMilk: record.amMilk,
    pmMilk: record.pmMilk,
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
