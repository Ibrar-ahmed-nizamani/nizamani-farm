"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface TransactionQuery {
  customerId: ObjectId;
  workId: { $exists: false };
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
    const type = formData.get("type") as string; // Added type field (CREDIT or DEBIT)

    // Insert transaction
    await db.collection("transactions").insertOne({
      customerId: new ObjectId(customerId),
      amount,
      date,
      description,
      type, // Use the submitted type value
      createdAt: new Date(),
    });

    // Update customer's totalPaid or totalDebit based on transaction type
    if (type === "CREDIT") {
      await db
        .collection("customers")
        .updateOne(
          { _id: new ObjectId(customerId) },
          { $inc: { totalPaid: amount } }
        );
    } else if (type === "DEBIT") {
      await db
        .collection("customers")
        .updateOne(
          { _id: new ObjectId(customerId) },
          { $inc: { totalDebit: amount } }
        );
    }

    revalidatePath(`/accounting/tractor`);
    revalidatePath(`/accounting/tractor/${customerId}`);
    revalidatePath(`/accounting/tractor/${customerId}/transaction`);
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, message: "Failed to add transaction" };
  }
  redirect(`/accounting/tractor/${customerId}/transaction`);
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

    // Update customer's totalPaid or totalDebit based on transaction type
    if (transaction.type === "CREDIT") {
      await db
        .collection("customers")
        .updateOne(
          { _id: new ObjectId(customerId) },
          { $inc: { totalPaid: -transaction.amount } }
        );
    } else if (transaction.type === "DEBIT") {
      await db
        .collection("customers")
        .updateOne(
          { _id: new ObjectId(customerId) },
          { $inc: { totalDebit: -transaction.amount } }
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

export async function updateTransaction(
  transactionId: string,
  customerId: string,
  updatedData: {
    amount: number;
    description: string;
    date: Date;
    type: string; // Added type for update
  }
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
          type: updatedData.type, // Update transaction type
        },
      }
    );

    // Handle customer totalPaid and totalDebit updates based on transaction type changes
    if (originalTransaction.type === updatedData.type) {
      // Same type, just update the amount difference
      const amountDifference = updatedData.amount - originalTransaction.amount;
      if (originalTransaction.type === "CREDIT") {
        await db
          .collection("customers")
          .updateOne(
            { _id: new ObjectId(customerId) },
            { $inc: { totalPaid: amountDifference } }
          );
      } else if (originalTransaction.type === "DEBIT") {
        await db
          .collection("customers")
          .updateOne(
            { _id: new ObjectId(customerId) },
            { $inc: { totalDebit: amountDifference } }
          );
      }
    } else {
      // Type changed (CREDIT to DEBIT or DEBIT to CREDIT)
      // Remove the effect of the original transaction
      if (originalTransaction.type === "CREDIT") {
        await db
          .collection("customers")
          .updateOne(
            { _id: new ObjectId(customerId) },
            { $inc: { totalPaid: -originalTransaction.amount } }
          );
      } else if (originalTransaction.type === "DEBIT") {
        await db
          .collection("customers")
          .updateOne(
            { _id: new ObjectId(customerId) },
            { $inc: { totalDebit: -originalTransaction.amount } }
          );
      }

      // Add the effect of the new transaction
      if (updatedData.type === "CREDIT") {
        await db
          .collection("customers")
          .updateOne(
            { _id: new ObjectId(customerId) },
            { $inc: { totalPaid: updatedData.amount } }
          );
      } else if (updatedData.type === "DEBIT") {
        await db
          .collection("customers")
          .updateOne(
            { _id: new ObjectId(customerId) },
            { $inc: { totalDebit: updatedData.amount } }
          );
      }
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
export async function getCustomerTransactions(
  customerId: string,
  year?: string,
  month?: string,
  startDate?: string,
  endDate?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const query: TransactionQuery = {
      customerId: new ObjectId(customerId),
      workId: { $exists: false },
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (year && year !== "all") {
      const startYear = parseInt(year);
      if (month && month !== "all") {
        const startMonth = parseInt(month) - 1; // Convert to 0-based month
        const endMonth = startMonth + 1;
        query.date = {
          $gte: new Date(startYear, startMonth, 1),
          $lte: new Date(startYear, endMonth, 0), // Last day of the month
        };
      } else {
        query.date = {
          $gte: new Date(startYear, 0, 1),
          $lte: new Date(startYear, 11, 31),
        };
      }
    }

    const transactions = await db
      .collection("transactions")
      .find(query)
      .sort({ date: -1 })
      .toArray();

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

export async function getTransactionAvailableYears(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get unique years from all transactions, not just CREDIT
    const dates = await db.collection("transactions").distinct("date", {
      customerId: new ObjectId(customerId),
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

export async function getCustomerTransactionDates(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const dates = await db.collection("transactions").distinct("date", {
      customerId: new ObjectId(customerId),
    });

    return dates.map((date) => new Date(date));
  } catch (error) {
    console.error("Failed to fetch transaction dates:", error);
    return [];
  }
}
