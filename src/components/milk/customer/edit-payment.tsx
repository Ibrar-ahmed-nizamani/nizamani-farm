"use client";

import { useState } from "react";
import { z } from "zod";
import { Path } from "react-hook-form";
import { updateMilkPayment } from "@/lib/actions/milk-customer-actions";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/shared/edit-dialog";

// Define the schema with proper types
const editPaymentSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.coerce.number().positive("Must be a valid positive number"),
  description: z.string().min(1, "Description is required"),
});

// This will now correctly infer amount as number
type EditPaymentFormData = z.infer<typeof editPaymentSchema>;

interface Payment {
  _id: string;
  date: string;
  amount: number;
  description: string;
}

interface EditPaymentProps {
  customerId: string;
  payment: Payment;
}

export function EditPayment({ customerId, payment }: EditPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (values: EditPaymentFormData) => {
    await updateMilkPayment(
      customerId,
      payment._id,
      values.amount, // No need to convert to number anymore
      new Date(values.date),
      values.description
    );
  };

  const fields: Array<{
    name: Path<EditPaymentFormData>;
    label: string;
    type: "text" | "number" | "date" | "textarea";
    placeholder?: string;
  }> = [
    {
      name: "date",
      label: "Date",
      type: "date",
      placeholder: "Select date",
    },
    {
      name: "amount",
      label: "Amount (Rs)",
      type: "number",
      placeholder: "Enter amount",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description",
    },
  ];

  const initialData: EditPaymentFormData = {
    date: payment.date.split("T")[0],
    amount: payment.amount, // No need to convert to string
    description: payment.description,
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
        title="Edit Payment"
        initialData={initialData}
        schema={editPaymentSchema}
        fields={fields}
      />
    </>
  );
}
