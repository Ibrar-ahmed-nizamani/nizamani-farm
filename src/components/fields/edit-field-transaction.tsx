// components/fields/field-transactions/edit-field-transaction.tsx
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/shared/edit-dialog";
import { format } from "date-fns";
import { updateFieldExpense } from "@/lib/actions/field";

// Define the form schema with Zod
const editFieldTransactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  expenseType: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
});

type EditFieldTransactionFormData = z.infer<typeof editFieldTransactionSchema>;

interface FieldExpense {
  _id: string;
  type: "expense" | "income";
  expenseType?: string;
  expenseTypeId?: string;
  amount: number;
  date: Date | string;
  description: string;
  farmerShare: number;
}

interface ExpenseType {
  _id: string;
  name: string;
  farmerExpenseSharePercentage: number;
  shareType: string;
}

interface EditFieldTransactionProps {
  fieldId: string;
  farmerId: string;
  expense: FieldExpense;
  expenseTypes: ExpenseType[];
}

export function EditFieldTransaction({
  fieldId,
  farmerId,
  expense,
  expenseTypes,
}: EditFieldTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"expense" | "income">(
    expense.type
  );
  const [farmerShare, setFarmerShare] = useState<number>(
    expense.farmerShare || 0
  );
  const [formFields, setFormFields] = useState<any[]>([]);

  // Format date properly for the form
  const formattedDate =
    typeof expense.date === "string"
      ? expense.date.split("T")[0]
      : format(expense.date, "yyyy-MM-dd");

  const initialData: EditFieldTransactionFormData = {
    type: expense.type,
    expenseType: expense.expenseTypeId,
    amount: expense.amount,
    date: formattedDate,
    description: expense.description,
  };

  // Update fields when selected type changes
  useEffect(() => {
    setFormFields(getFields());
  }, [selectedType]);

  const handleSubmit = async (values: EditFieldTransactionFormData) => {
    // Get expense type details for farmer share percentage
    let finalFarmerShare = farmerShare;
    if (values.type === "expense" && values.expenseType) {
      const expenseType = expenseTypes.find(
        (et) => et._id === values.expenseType
      );
      if (expenseType) {
        finalFarmerShare = expenseType.farmerExpenseSharePercentage;
      }
    } else if (values.type === "income") {
      // Keep existing farmer share for income
      finalFarmerShare = expense.farmerShare;
    }

    await updateFieldExpense(fieldId, farmerId, expense._id, {
      type: values.type,
      expenseType: values.expenseType,
      amount: values.amount,
      date: new Date(values.date),
      description: values.description,
      farmerShare: finalFarmerShare,
    });

    setIsOpen(false);
  };

  // Handle field changes
  const handleFieldChange = (fieldName: string, value: any) => {
    if (fieldName === "type") {
      setSelectedType(value as "expense" | "income");
    } else if (fieldName === "expenseType") {
      const expenseType = expenseTypes.find((et) => et._id === value);
      if (expenseType) {
        setFarmerShare(expenseType.farmerExpenseSharePercentage);
      }
    }
  };

  // Dynamic fields based on transaction type
  function getFields() {
    const baseFields = [
      {
        name: "type",
        label: "Transaction Type",
        type: "select",
        placeholder: "Select transaction type",
        options: [
          { label: "Expense", value: "expense" },
          { label: "Income", value: "income" },
        ],
      },
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

    // Add expense type field if the transaction type is expense
    if (selectedType === "expense") {
      baseFields.splice(1, 0, {
        name: "expenseType",
        label: "Expense Type",
        type: "select",
        placeholder: "Select expense type",
        options: expenseTypes.map((type) => ({
          label: `${type.name} (${type.farmerExpenseSharePercentage}%)`,
          value: type._id,
        })),
      });
    }

    return baseFields;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setSelectedType(expense.type);
          setFarmerShare(expense.farmerShare || 0);
          setFormFields(getFields());
          setIsOpen(true);
        }}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>

      <EditDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="Edit Field Transaction"
        initialData={initialData}
        schema={editFieldTransactionSchema}
        fields={formFields}
        onFieldChange={handleFieldChange}
      />
    </>
  );
}
