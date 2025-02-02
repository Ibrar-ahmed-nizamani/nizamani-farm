"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface TransactionQuery {
  customerId: ObjectId;
  date?: {
    $gte: Date;
    $lte: Date;
  };
}

export async function addTransaction(prevState: unknown, formData: FormData) {
  const customerId = formData.get("customerId") as string;
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const amount = parseFloat(formData.get("amount") as string);
    const date = new Date(formData.get("date") as string);
    const description = formData.get("description") as string;

    // Insert transaction
    await db.collection("transactions").insertOne({
      customerId: new ObjectId(customerId),
      amount,
      date,
      description,
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

    revalidatePath(`/accounting/tractor`);
    revalidatePath(`/accounting/tractor/${customerId}`);
    revalidatePath(`/accounting/tractor/${customerId}/transaction`);
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, message: "Failed to add transaction" };
  }
  redirect(`/accounting/tractor/${customerId}/transaction`);
}

export async function getCustomerTransactions(
  customerId: string,
  year?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const query: TransactionQuery = { customerId: new ObjectId(customerId) };
    if (year && year !== "all") {
      query.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const transactions = await db
      .collection("transactions")
      .find(query)
      .sort({ date: -1 })
      .toArray();
    // Serialize the transactions data
    return transactions.map((transaction) => ({
      _id: transaction._id.toString(),
      customerId: transaction.customerId.toString(),
      amount: transaction.amount,
      date: transaction.date.toISOString(),
      description: transaction.description,
      type: transaction.type,
      createdAt: transaction.createdAt?.toISOString(),
      updatedAt: transaction.updatedAt?.toISOString(),
      customerName: transaction.customerName,
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function deleteTransaction(
  transactionId: string,
  customerId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the transaction amount before deleting
    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(transactionId) });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Delete the transaction
    await db
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(transactionId) });

    // Update customer's totalPaid
    if (transaction.type === "CREDIT") {
      await db
        .collection("customers")
        .updateOne(
          { _id: new ObjectId(customerId) },
          { $inc: { totalPaid: -transaction.amount } }
        );
    }

    revalidatePath(`/accounting/tractor`);
    revalidatePath(`/accounting/tractor/${customerId}`);
    revalidatePath(`/accounting/tractor/${customerId}/transaction`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

export async function getTransactionAvailableYears(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get unique years from CREDIT transactions only
    const dates = await db.collection("transactions").distinct("date", {
      customerId: new ObjectId(customerId),
      type: "CREDIT",
    });

    // Convert dates to years and sort
    const uniqueYears = Array.from(
      new Set(dates.map((date) => new Date(date).getFullYear()))
    ).sort((a, b) => b - a); // Sort years in descending order

    return uniqueYears;
  } catch (error) {
    console.error("Failed to fetch transaction years:", error);
    return [];
  }
}

export async function updateTransaction(
  transactionId: string,
  customerId: string,
  updatedData: { amount: number; description: string; date: Date }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the original transaction to calculate the difference in amount
    const originalTransaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(transactionId) });

    if (!originalTransaction) {
      throw new Error("Transaction not found");
    }

    // Update the transaction
    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          amount: updatedData.amount,
          description: updatedData.description,
          date: updatedData.date,
        },
      }
    );

    // Calculate the difference in amount and update the customer's totalPaid
    const amountDifference = updatedData.amount - originalTransaction.amount;
    if (originalTransaction.type === "CREDIT") {
      await db
        .collection("customers")
        .updateOne(
          { _id: new ObjectId(customerId) },
          { $inc: { totalPaid: amountDifference } }
        );
    }

    revalidatePath(`/accounting/tractor`);
    revalidatePath(`/accounting/tractor/${customerId}`);
    revalidatePath(`/accounting/tractor/${customerId}/transaction`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return { success: false, error: "Failed to update transaction" };
  }
}
