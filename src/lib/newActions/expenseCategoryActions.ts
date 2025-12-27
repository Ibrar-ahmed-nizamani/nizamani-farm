"use server";

import { getDbV2 } from "@/lib/db/v2";
import { ExpenseCategory } from "@/lib/types/ExpenseCategory";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function createExpenseCategory(prevState: any, formData: FormData) {
  const categoryRaw = formData.get("category") as string;
  const nameRaw = formData.get("name") as string;

  const category = categoryRaw?.trim().toLowerCase();
  const name = nameRaw?.trim().toLowerCase();

  const errors: { category?: string[]; name?: string[] } = {};

  if (!category) {
    errors.category = ["Category is required"];
  }
  if (!name) {
    errors.name = ["Name is required"];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const db = await getDbV2();
  
  // Check for duplicate
  const existing = await db.collection<ExpenseCategory>("expenseCategories").findOne({
    category: category,
    name: name,
  });

  if (existing) {
    return {
      success: false,
      errors: {
        name: ["Item name already exists for this category"],
      },
    };
  }

  const result = await db.collection<ExpenseCategory>("expenseCategories").insertOne({
    category,
    name,
    _id: new ObjectId(),
    createdAt: new Date(),
  });
  
  revalidatePath("/farmers/configuration");
  return { success: true, message: "Category created successfully" };
}

export async function getExpenseCategories() {
  const db = await getDbV2();
  const categories = await db.collection<ExpenseCategory>("expenseCategories").find({}).sort({ category: 1, name: 1 }).toArray();
  return categories.map(cat => ({
    ...cat,
    _id: cat._id.toString(),
    createdAt: new Date(cat.createdAt).toISOString(),
  }));
}

export async function deleteExpenseCategory(id: string) {
  const db = await getDbV2();
  await db.collection("expenseCategories").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/farmers/configuration");
}
