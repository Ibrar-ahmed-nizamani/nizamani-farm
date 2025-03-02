"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Existing functions like getField and getFieldFarmers should be here

export async function getFieldShareExpenses(
  fieldId: string,
  shareType: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const expenses = await db
      .collection("share_settings")
      .find({
        fieldId: new ObjectId(fieldId),
        shareType: shareType,
      })
      .sort({ name: 1 })
      .toArray();

    return expenses.map((expense) => ({
      ...expense,
      _id: expense._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch field share expenses:", error);
    throw new Error("Failed to fetch field share expenses");
  }
}

export async function addFarmerShareExpense(
  fieldId: string,
  data: {
    name: string;
    farmerExpenseSharePercentage: number;
    shareType: string;
  }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db.collection("share_settings").insertOne({
      fieldId: new ObjectId(fieldId),
      name: data.name,
      farmerExpenseSharePercentage: data.farmerExpenseSharePercentage,
      shareType: data.shareType,
      createdAt: new Date(),
    });

    revalidatePath(`/fields/${fieldId}/share-setting`);
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
