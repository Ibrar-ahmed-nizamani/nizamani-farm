"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addTractorExpense(
  prevState: unknown,
  formData: FormData
) {
  const tractorId = formData.get("tractorId") as string;
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const amount = parseFloat(formData.get("amount") as string);
    const date = new Date(formData.get("date") as string);
    const description = formData.get("description") as string;

    await db.collection("tractorExpenses").insertOne({
      tractorId: new ObjectId(tractorId),
      amount,
      date,
      description,
      createdAt: new Date(),
    });

    revalidatePath(`/tractor/${tractorId}/expenses`);
  } catch (error) {
    console.error("Failed to add expense:", error);
    return { success: false, message: "Failed to add expense" };
  }
  redirect(`/tractor/${tractorId}/expenses`);
}

export async function getTractorExpenses(tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const expenses = await db
      .collection("tractorExpenses")
      .find({ tractorId: new ObjectId(tractorId) })
      .sort({ date: -1 })
      .toArray();

    return expenses.map((expense) => ({
      _id: expense._id.toString(),
      description: expense.description,
      amount: expense.amount,
      date: expense.date.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

export async function deleteTractorExpense(
  expenseId: string,
  tractorId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db
      .collection("tractorExpenses")
      .deleteOne({ _id: new ObjectId(expenseId) });

    revalidatePath(`/tractor/${tractorId}/expenses`);
    return { success: true, message: "Expense deleted successfully" };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, message: "Failed to delete expense" };
  }
}

export async function getAllTractorExpenses(tractorId: string, year?: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const query: { tractorId: ObjectId; date?: { $gte: Date; $lte: Date } } = {
      tractorId: new ObjectId(tractorId),
    };

    if (year && year !== "all") {
      query.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const expenses = await db
      .collection("tractorExpenses")
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return expenses.map((expense) => ({
      _id: expense._id.toString(),
      description: expense.description,
      amount: expense.amount,
      date: expense.date.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

export async function getExpenseYears(tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const years = await db
      .collection("tractorExpenses")
      .distinct("date", { tractorId: new ObjectId(tractorId) });

    return Array.from(
      new Set(years.map((date) => new Date(date).getFullYear()))
    ).sort((a, b) => b - a);
  } catch (error) {
    console.error("Failed to fetch expense years:", error);
    return [];
  }
}
