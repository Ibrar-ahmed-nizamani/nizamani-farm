"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getMilkWorkers() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const workers = await db
      .collection("milk_workers")
      .find({})
      .sort({ name: 1 })
      .toArray();

    return workers.map((worker) => ({
      name: worker.name,
      _id: worker._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch milk workers:", error);
    return [];
  }
}

export async function getMilkWorker(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const worker = await db
      .collection("milk_workers")
      .findOne({ _id: new ObjectId(id) });

    if (!worker) {
      throw new Error("Worker not found");
    }

    return {
      name: worker.name,
      _id: worker._id.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch milk worker:", error);
    throw new Error("Failed to fetch milk worker");
  }
}

export async function addMilkWorker(name: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Check if worker with same name exists
    const existingWorker = await db
      .collection("milk_workers")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingWorker) {
      return {
        success: false,
        error: "A worker with this name already exists",
      };
    }

    await db.collection("milk_workers").insertOne({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/milk/workers");
    return { success: true };
  } catch (error) {
    console.error("Failed to add milk worker:", error);
    return {
      success: false,
      error: "Failed to add worker",
    };
  }
}

export async function getMilkWorkerTransactions(
  workerId: string,
  year?: string,
  month?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Build date filter based on year and month
    interface DateFilter {
      workerId: ObjectId;
      date?: {
        $gte: Date;
        $lt: Date;
      };
    }

    const dateFilter: DateFilter = {
      workerId: new ObjectId(workerId),
    };

    if (year) {
      const startDate = month
        ? new Date(`${year}-${month}-01`)
        : new Date(`${year}-01-01`);

      const endDate = month
        ? new Date(new Date(startDate).setMonth(startDate.getMonth() + 1))
        : new Date(`${year}-12-31`);

      dateFilter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const transactions = await db
      .collection("milk_worker_transactions")
      .find(dateFilter)
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      _id: transaction._id.toString(),
      workerId: transaction.workerId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch milk worker transactions:", error);
    return [];
  }
}

export async function getMilkWorkerDates(workerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Build date filter based on year and month
    interface DateFilter {
      workerId: ObjectId;
      date?: {
        $gte: Date;
        $lt: Date;
      };
    }

    const dateFilter: DateFilter = {
      workerId: new ObjectId(workerId),
    };

    const transactions = await db
      .collection("milk_worker_transactions")
      .find(dateFilter)
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      date: transaction.date,
      _id: transaction._id.toString(),
      workerId: transaction.workerId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch milk worker Dates:", error);
    return [];
  }
}

export async function addMilkWorkerTransaction(
  workerId: string,
  type: "debit" | "credit",
  amount: number,
  date: Date,
  description: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Verify worker exists
    const worker = await db
      .collection("milk_workers")
      .findOne({ _id: new ObjectId(workerId) });

    if (!worker) {
      return {
        success: false,
        error: "Worker not found",
      };
    }

    await db.collection("milk_worker_transactions").insertOne({
      workerId: new ObjectId(workerId),
      type,
      amount,
      date: new Date(date),
      description,
      createdAt: new Date(),
    });

    revalidatePath(`/milk/workers/${workerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add worker transaction:", error);
    return {
      success: false,
      error: "Failed to add transaction",
    };
  }
}

export async function deleteMilkWorkerTransaction(
  workerId: string,
  transactionId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // First, verify the transaction exists and belongs to the worker
    const transaction = await db
      .collection("milk_worker_transactions")
      .findOne({
        _id: new ObjectId(transactionId),
        workerId: new ObjectId(workerId),
      });

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Delete the transaction
    await db.collection("milk_worker_transactions").deleteOne({
      _id: new ObjectId(transactionId),
    });

    revalidatePath(`/milk/workers/${workerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete worker transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}
