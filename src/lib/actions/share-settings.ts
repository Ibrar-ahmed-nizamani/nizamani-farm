"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { convertShareTypes } from "../utils";

// Existing functions like getField and getFieldFarmers should be here
export async function getFieldShareExpenses(shareType: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const expenses = await db
      .collection("share_settings")
      .find({
        shareType: shareType,
      })
      .sort({ name: 1 })
      .toArray();

    return expenses.map((expense) => ({
      ...expense,
      fieldId: expense.fieldId ? expense.fieldId.toString() : undefined,
      name: expense.name,
      farmerExpenseSharePercentage: expense.farmerExpenseSharePercentage,
      shareType: expense.shareType,
      _id: expense._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch field share expenses:", error);
    throw new Error("Failed to fetch field share expenses");
  }
}

export async function addFarmerShareExpense(data: {
  name: string;
  farmerExpenseSharePercentage: number;
  shareType: string;
  fieldId?: string; // Made fieldId optional
}) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const insertData: {
      name: string;
      farmerExpenseSharePercentage: number;
      shareType: string;
      createdAt: Date;
      fieldId?: ObjectId; // Made fieldId optional
    } = {
      name: data.name,
      farmerExpenseSharePercentage: data.farmerExpenseSharePercentage,
      shareType: data.shareType,
      createdAt: new Date(),
    };

    // Only add fieldId if it's provided
    if (data.fieldId) {
      insertData.fieldId = new ObjectId(data.fieldId);
    }

    await db.collection("share_settings").insertOne(insertData);

    // Only revalidate if fieldId is provided
    if (data.fieldId) {
      revalidatePath(`/fields/${data.fieldId}/share-setting`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to add field expense:", error);
    throw new Error("Failed to add field expense");
  }
}

export async function updateFieldExpense(
  expenseId: string,
  data: {
    name: string;
    farmerExpenseSharePercentage: number;
  }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const expense = await db.collection("share_settings").findOne({
      _id: new ObjectId(expenseId),
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    await db.collection("share_settings").updateOne(
      { _id: new ObjectId(expenseId) },
      {
        $set: {
          name: data.name,
          farmerExpenseSharePercentage: data.farmerExpenseSharePercentage,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath(`/fields/${expense.fieldId}/share-setting`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update field expense:", error);
    throw new Error("Failed to update field expense");
  }
}

export async function deleteFieldExpense(expenseId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const expense = await db.collection("share_settings").findOne({
      _id: new ObjectId(expenseId),
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    await db.collection("share_settings").deleteOne({
      _id: new ObjectId(expenseId),
    });

    revalidatePath(`/fields/${expense.fieldId}/share-setting`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete field expense:", error);
    throw new Error("Failed to delete field expense");
  }
}

// Updated function in share-settings.ts

export async function getExpenseTypes(shareType: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const convertedShareType = convertShareTypes(shareType);
    // Build query based on whether shareType is provided
    const query = convertedShareType ? { shareType: convertedShareType } : {};

    const expenseTypes = await db
      .collection("share_settings")
      .find(query)
      .sort({ name: 1 })
      .toArray();

    return expenseTypes.map((type) => ({
      _id: type._id.toString(),
      name: type.name,
      farmerExpenseSharePercentage: type.farmerExpenseSharePercentage,
      shareType: type.shareType,
    }));
  } catch (error) {
    console.error("Failed to fetch expense types:", error);
    return [];
  }
}
