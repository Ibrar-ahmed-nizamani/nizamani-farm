"use server";

import { getDbV2 } from "@/lib/db/v2";
import { ExpenseCategory } from "@/lib/types/ExpenseCategory";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function createExpenseCategory(data: Omit<ExpenseCategory, "_id" | "createdAt">) {
  const db = await getDbV2();
  const result = await db.collection<ExpenseCategory>("expenseCategories").insertOne({
    ...data,
    _id: new ObjectId(),
    createdAt: new Date(),
  });
  revalidatePath("/farmers/configuration");
  return { success: true, id: result.insertedId.toString() };
}

export async function getExpenseCategories() {
  const db = await getDbV2();
  const categories = await db.collection<ExpenseCategory>("expenseCategories").find({}).sort({ category: 1, name: 1 }).toArray();
  return categories.map(cat => ({
    ...cat,
    _id: cat._id.toString(),
  }));
}

export async function deleteExpenseCategory(id: string) {
  const db = await getDbV2();
  await db.collection("expenseCategories").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/farmers/configuration");
}
