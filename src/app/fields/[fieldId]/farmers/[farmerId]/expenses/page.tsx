// app/fields/[fieldId]/farmers/[farmerId]/expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { getField, getFieldExpenses } from "@/lib/actions/field";
import { getShareSettings } from "@/lib/actions/share-settings";
import {
  Field,
  FieldExpense,
  ShareSetting,
  FieldFarmer,
} from "@/lib/type-definitions";

// This function would be placed in a separate file and imported
async function getFieldFarmer(fieldId: string, farmerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const fieldFarmer = await db.collection("field_farmers").findOne({
      fieldId: new ObjectId(fieldId),
      farmerId: new ObjectId(farmerId),
    });

    if (!fieldFarmer) {
      throw new Error("Farmer not found in this field");
    }

    // Get farmer details
    const farmer = await db
      .collection("farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    return {
      ...fieldFarmer,
      _id: fieldFarmer._id.toString(),
      fieldId: fieldFarmer.fieldId.toString(),
      farmerId: fieldFarmer.farmerId.toString(),
      name: farmer?.name || "Unknown Farmer",
    };
  } catch (error) {
    console.error("Failed to fetch field farmer:", error);
    throw new Error("Failed to fetch field farmer");
  }
}

// Mapping of known expense type IDs to names
const knownExpenseTypes: Record<string, string> = {
  tractor: "Tractor Expenses",
  cultivator: "Cultivator Expenses",
  seeds: "Seeds",
  fertilizer: "Fertilizer",
  pesticides: "Pesticides",
  irrigation: "Irrigation",
};

export default function FarmerExpensesPage({
  params,
}: {
  params: { fieldId: string; farmerId: string };
}) {
  const [expenses, setExpenses] = useState<FieldExpense[]>([]);
  const [shareSettings, setShareSettings] = useState<ShareSetting[]>([]);
  const [fieldFarmer, setFieldFarmer] = useState<FieldFarmer | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [expensesData, settingsData, farmerData, fieldData] =
          await Promise.all([
            getFieldExpenses(params.fieldId),
            getShareSettings(),
            getFieldFarmer(params.fieldId, params.farmerId),
            getField(params.fieldId),
          ]);

        setExpenses(expensesData);
        setShareSettings(settingsData);
        setFieldFarmer(farmerData as FieldFarmer);
        setField(fieldData as Field);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.fieldId, params.farmerId]);

  const getExpenseTypeName = (expenseTypeId?: string) => {
    if (!expenseTypeId) return "Other";
    return knownExpenseTypes[expenseTypeId] || expenseTypeId;
  };

  // Calculate farmer's portion of an expense based on share type and expense type
  const calculateFarmerPortion = (expense: FieldExpense) => {
    if (!fieldFarmer || !expense.expenseTypeId) return expense.amount / 2; // Default to 50% if no type

    const setting = shareSettings.find(
      (s) => s.shareType === fieldFarmer.shareType
    );
    if (!setting) return expense.amount / 2;

    const allocation = setting.expenseAllocations.find(
      (a) => a.expenseTypeId === expense.expenseTypeId
    );
    if (!allocation) return expense.amount / 2;

    return (expense.amount * allocation.farmerPercentage) / 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!fieldFarmer) {
    return (
      <div className="container mx-auto py-10">
        Farmer not found in this field
      </div>
    );
  }

  // Filter expenses that have expense types configured for this share type
  const relevantExpenses = expenses.filter((expense) => {
    if (!expense.expenseTypeId) return false;

    const setting = shareSettings.find(
      (s) => s.shareType === fieldFarmer.shareType
    );
    if (!setting) return false;

    return setting.expenseAllocations.some(
      (a) => a.expenseTypeId === expense.expenseTypeId
    );
  });

  const totalFarmerExpenses = relevantExpenses.reduce(
    (sum, expense) => sum + calculateFarmerPortion(expense),
    0
  );

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Expenses for {fieldFarmer.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-500">Field</p>
              <p className="text-lg font-medium">{field?.name}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-500">Share Type</p>
              <p className="text-lg font-medium">{fieldFarmer.shareType}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-500">Allocated Area</p>
              <p className="text-lg font-medium">
                {fieldFarmer.allocatedArea} acres
              </p>
            </div>
          </div>

          {relevantExpenses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No expenses recorded for this farmer based on their share type.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">
                      Farmer's Portion
                    </TableHead>
                    <TableHead className="text-right">
                      Owner's Portion
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relevantExpenses.map((expense) => {
                    const farmerPortion = calculateFarmerPortion(expense);
                    const ownerPortion = expense.amount - farmerPortion;

                    return (
                      <TableRow key={expense._id}>
                        <TableCell>
                          {format(new Date(expense.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          {getExpenseTypeName(expense.expenseTypeId)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${farmerPortion.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${ownerPortion.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-500">Total Farmer Expenses</p>
                <p className="text-xl font-medium">
                  ${totalFarmerExpenses.toFixed(2)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
