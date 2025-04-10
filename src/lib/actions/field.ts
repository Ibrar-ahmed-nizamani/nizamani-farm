// lib/actions/field.ts
"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function addField(name: string, totalArea: number) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Check if field with same name exists
    const existingField = await db
      .collection("fields")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingField) {
      return {
        success: false,
        error: "A field with this name already exists",
      };
    }

    await db.collection("fields").insertOne({
      name,
      totalArea,
      remainingArea: totalArea, // Initialize remainingArea equal to totalArea
      createdAt: new Date(),
    });

    revalidatePath("/fields");
    return { success: true };
  } catch (error) {
    console.error("Failed to add field:", error);
    return {
      success: false,
      error: "Failed to add field",
    };
  }
}

export async function getRemainingArea(fieldId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const field = await db
      .collection("fields")
      .findOne({ _id: new ObjectId(fieldId) });

    if (!field) {
      throw new Error("Field not found");
    }

    return {
      success: true,
      remainingArea: field.remainingArea,
    };
  } catch (error) {
    console.error("Failed to fetch remaining area:", error);
    return {
      success: false,
      error: "Failed to fetch remaining area",
    };
  }
}

export async function getFields() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const fields = await db
      .collection("fields")
      .find({})
      .sort({ name: 1 })
      .toArray();

    return fields.map((field) => ({
      ...field,
      name: field.name,
      totalArea: field.totalArea,
      _id: field._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch fields:", error);
    return [];
  }
}

export async function getField(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const field = await db
      .collection("fields")
      .findOne({ _id: new ObjectId(id) });

    if (!field) {
      throw new Error("Field not found");
    }

    return {
      ...field,
      name: field.name,
      _id: field._id.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch field:", error);
    throw new Error("Failed to fetch field");
  }
}

export async function getFieldFarmers(fieldId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get all farmers for this field
    const fieldFarmers = await db
      .collection("field_farmers")
      .find({ fieldId: new ObjectId(fieldId) })
      .toArray();

    // Get farmer details for each field farmer
    const farmerIds = fieldFarmers.map((ff) => new ObjectId(ff.farmerId));
    const farmers = await db
      .collection("farmers")
      .find({ _id: { $in: farmerIds } })
      .toArray();

    // Create a map of farmer details
    const farmerMap = new Map(farmers.map((f) => [f._id.toString(), f]));

    // Combine field farmer data with farmer details
    return fieldFarmers.map((ff) => ({
      _id: ff._id.toString(),
      fieldId: ff.fieldId.toString(),
      farmerId: ff.farmerId.toString(),
      name: farmerMap.get(ff.farmerId.toString())?.name || "Unknown Farmer",
      shareType: ff.shareType,
      allocatedArea: ff.allocatedArea,
      startDate: ff.startDate,
      endDate: ff.endDate,
      status: ff.status,
      createdAt: ff.createdAt,
    }));
  } catch (error) {
    console.error("Failed to fetch field farmers:", error);
    return [];
  }
}

export async function getFieldExpenses(fieldId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const expenses = await db
      .collection("field_expenses")
      .find({ fieldId: new ObjectId(fieldId) })
      .sort({ date: -1 })
      .toArray();

    return expenses.map((expense) => ({
      ...expense,
      _id: expense._id.toString(),
      fieldId: expense.fieldId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch field expenses:", error);
    return [];
  }
}

export async function getFieldSummary(fieldId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get field details
    const field = await getField(fieldId);

    // Get all farmers in the field
    const fieldFarmers = await getFieldFarmers(fieldId);

    // Get total expenses
    const expenses = await getFieldExpenses(fieldId);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate total allocated area
    const totalAllocatedArea = fieldFarmers.reduce(
      (sum, ff) => sum + ff.allocatedArea,
      0
    );

    // Get farmer transactions
    const transactions = await db
      .collection("farmer_transactions")
      .find({ fieldId: new ObjectId(fieldId) })
      .toArray();

    // Calculate balances for each farmer
    const farmerBalances = fieldFarmers.map((farmer) => {
      const farmerTransactions = transactions.filter(
        (t) => t.farmerId.toString() === farmer.farmerId
      );

      const balance = farmerTransactions.reduce(
        (sum, t) => sum + (t.type === "CREDIT" ? t.amount : -t.amount),
        0
      );

      return {
        farmerId: farmer.farmerId,
        name: farmer.name,
        allocatedArea: farmer.allocatedArea,
        shareType: farmer.shareType,
        balance,
      };
    });

    return {
      field,
      totalExpenses,
      totalAllocatedArea,
      remainingArea: field.totalArea - totalAllocatedArea,
      activeFarmers: fieldFarmers.filter((f) => f.status === "ACTIVE").length,
      farmerBalances,
    };
  } catch (error) {
    console.error("Failed to fetch field summary:", error);
    throw new Error("Failed to fetch field summary");
  }
}

// This is an update to the existing addFieldExpense function in lib/actions/field.ts
export async function addFieldExpense(
  fieldId: string,
  farmerId: string,
  data: {
    type: "expense" | "income";
    expenseType?: string;
    amount: number;
    date: Date;
    description: string;
    farmerShare: number;
  }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get expense type details if provided
    let expenseTypeDetails = null;
    if (data.type === "expense" && data.expenseType) {
      expenseTypeDetails = await db
        .collection("share_settings")
        .findOne({ _id: new ObjectId(data.expenseType) });
    }

    // Insert the field expense record
    await db.collection("field_expenses").insertOne({
      fieldId: new ObjectId(fieldId),
      farmerId: new ObjectId(farmerId),
      type: data.type,
      expenseType:
        data.type === "expense"
          ? expenseTypeDetails
            ? expenseTypeDetails.name
            : undefined
          : undefined,
      expenseTypeId:
        data.type === "expense"
          ? data.expenseType
            ? new ObjectId(data.expenseType)
            : undefined
          : undefined,
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
      farmerShare: data.farmerShare,
      createdAt: new Date(),
    });

    revalidatePath(`/fields/${fieldId}/farmers/${farmerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add field expense:", error);
    throw new Error("Failed to add field expense");
  }
}
