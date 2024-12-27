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

    return expenses;
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    throw new Error("Failed to fetch expenses");
  }
}
