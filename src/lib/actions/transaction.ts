"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function addTransaction(prevState: unknown, formData: FormData) {
  const customerId = formData.get("customerId") as string;
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const amount = parseFloat(formData.get("amount") as string);
    const date = new Date(formData.get("date") as string);

    // Insert transaction
    await db.collection("transactions").insertOne({
      customerId: new ObjectId(customerId),
      amount,
      date,
      type: "CREDIT",
      createdAt: new Date(),
    });

    // Update customer's totalPaid
    await db
      .collection("customers")
      .updateOne(
        { _id: new ObjectId(customerId) },
        { $inc: { totalPaid: amount } }
      );

    revalidatePath(`/accounting/tractor/${customerId}`);
    revalidatePath(`/accounting/tractor/${customerId}/transaction`);
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, message: "Failed to add transaction" };
  }
  redirect(`/accounting/tractor/${customerId}/transaction`);
}

export async function getCustomerTransactions(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const transactions = await db
      .collection("transactions")
      .find({ customerId: new ObjectId(customerId) })
      .sort({ date: -1 })
      .toArray();

    return transactions;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}
