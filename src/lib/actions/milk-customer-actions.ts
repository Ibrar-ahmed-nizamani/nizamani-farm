"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

interface MilkRecord {
  customerId: ObjectId;
  date: Date;
  quantity: number;
  price: number;
  amount: number;
  createdAt: Date;
}

interface MilkCustomer {
  name: string;
  defaultQuantity?: number;
  defaultPrice?: number;
  totalDebit: number;
  totalPaid: number;
  createdAt: Date;
}

export async function getMilkCustomers() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const customers = await db
      .collection("milk-customers")
      .find({})
      .sort({ name: 1 })
      .toArray();

    return customers.map((customer) => ({
      _id: customer._id.toString(),
      name: customer.name,
      defaultQuantity: customer.defaultQuantity || 0,
      defaultPrice: customer.defaultPrice || 0,
      totalDebit: customer.totalDebit || 0,
      totalPaid: customer.totalPaid || 0,
      createdAt: customer.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch milk customers:", error);
    throw new Error("Failed to fetch milk customers");
  }
}

export async function addMilkCustomer(name: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const existingCustomer = await db
      .collection("milk-customers")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingCustomer) {
      return {
        success: false,
        error: "Customer with this name already exists",
      };
    }

    const newCustomer: MilkCustomer = {
      name,
      defaultQuantity: 0,
      defaultPrice: 0,
      totalDebit: 0,
      totalPaid: 0,
      createdAt: new Date(),
    };

    await db.collection("milk-customers").insertOne(newCustomer);

    revalidatePath("/milk/customers");
    return { success: true };
  } catch (error) {
    console.error("Failed to add milk customer:", error);
    return { success: false, error: "Failed to add customer" };
  }
}

export async function getMilkCustomer(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const customer = await db
      .collection("milk-customers")
      .findOne({ _id: new ObjectId(customerId) });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return {
      ...customer,
      _id: customer._id.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch milk customer:", error);
    throw new Error("Failed to fetch milk customer");
  }
}

export async function updateMilkCustomerDefaults(
  customerId: string,
  defaultQuantity: number,
  defaultPrice: number
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db.collection("milk-customers").updateOne(
      { _id: new ObjectId(customerId) },
      {
        $set: {
          defaultQuantity,
          defaultPrice,
        },
      }
    );

    revalidatePath(`/milk/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update milk customer defaults:", error);
    return { success: false, error: "Failed to update customer defaults" };
  }
}
async function checkExistingMilkRecord(customerId: string, date: Date) {
  const client = await clientPromise;
  const db = client.db("farm");

  // Create start and end of the day for comparison
  const startDate = new Date(date.setHours(0, 0, 0, 0));
  const endDate = new Date(date.setHours(23, 59, 59, 999));

  const existingRecord = await db.collection("milk-records").findOne({
    customerId: new ObjectId(customerId),
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  return existingRecord;
}

export async function addMilkRecord(
  customerId: string,
  date: Date,
  quantity: number,
  price: number
) {
  try {
    const existingRecord = await checkExistingMilkRecord(customerId, date);
    if (existingRecord) {
      return {
        success: false,
        error:
          "Milk record already exists for this date. Please delete the existing record to add a new one.",
      };
    }

    const client = await clientPromise;
    const db = client.db("farm");

    const amount = quantity * price;
    const record: MilkRecord = {
      customerId: new ObjectId(customerId),
      date: new Date(date),
      quantity,
      price,
      amount,
      createdAt: new Date(),
    };

    await db.collection("milk-records").insertOne(record);

    // Update customer's totalDebit
    await db
      .collection("milk-customers")
      .updateOne(
        { _id: new ObjectId(customerId) },
        { $inc: { totalDebit: amount } }
      );

    revalidatePath(`/milk/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add milk record:", error);
    return { success: false, error: "Failed to add milk record" };
  }
}

export async function deleteMilkRecord(customerId: string, recordId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // First, get the record to know the amount to decrease
    const record = await db.collection("milk-records").findOne({
      _id: new ObjectId(recordId),
      customerId: new ObjectId(customerId),
    });

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    // Delete the record
    await db.collection("milk-records").deleteOne({
      _id: new ObjectId(recordId),
    });

    // Update customer's totalDebit by decreasing the amount
    await db
      .collection("milk-customers")
      .updateOne(
        { _id: new ObjectId(customerId) },
        { $inc: { totalDebit: -record.amount } }
      );

    revalidatePath(`/milk/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete milk record:", error);
    return { success: false, error: "Failed to delete milk record" };
  }
}

export async function addMilkPayment(
  customerId: string,
  amount: number,
  date: Date,
  description: string = "Milk Payment"
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db.collection("milk-transactions").insertOne({
      customerId: new ObjectId(customerId),
      amount,
      date: new Date(date),
      description,
      type: "CREDIT",
      createdAt: new Date(),
    });

    // Update customer's totalPaid
    await db
      .collection("milk-customers")
      .updateOne(
        { _id: new ObjectId(customerId) },
        { $inc: { totalPaid: amount } }
      );

    revalidatePath(`/milk/customers/${customerId}`);
    revalidatePath(`/milk/customers/${customerId}/transactions`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add milk payment:", error);
    return { success: false, error: "Failed to add payment" };
  }
}

export async function getMilkCustomerSummary(
  customerId: string,
  year?: string,
  month?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    let dateMatch = {};
    if (year && year !== "all") {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);

      if (month) {
        startDate.setMonth(parseInt(month) - 1);
        endDate.setMonth(parseInt(month), 0);
      }

      dateMatch = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const customer = await getMilkCustomer(customerId);

    const milkRecords = await db
      .collection("milk-records")
      .find({
        customerId: new ObjectId(customerId),
        ...dateMatch,
      })
      .sort({ date: -1 })
      .toArray();

    const transactions = await db
      .collection("milk-transactions")
      .find({
        customerId: new ObjectId(customerId),
        ...dateMatch,
      })
      .sort({ date: -1 })
      .toArray();

    const totalDebit = milkRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    const totalPaid = transactions.reduce(
      (sum, transaction) =>
        sum + (transaction.type === "CREDIT" ? transaction.amount : 0),
      0
    );
    const balance = totalDebit - totalPaid;

    return {
      customer,
      milkRecords: milkRecords.map((record) => ({
        ...record,
        _id: record._id.toString(),
        customerId: record.customerId.toString(),
      })),
      transactions: transactions.map((transaction) => ({
        ...transaction,
        _id: transaction._id.toString(),
        customerId: transaction.customerId.toString(),
      })),
      summary: {
        totalDebit,
        totalPaid,
        balance,
      },
    };
  } catch (error) {
    console.error("Failed to fetch milk customer summary:", error);
    throw new Error("Failed to fetch milk customer summary");
  }
}

export async function getMilkCustomerTransactions(
  customerId: string,
  year?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    let dateMatch = {};
    if (year && year !== "all") {
      dateMatch = {
        date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      };
    }

    const transactions = await db
      .collection("milk-transactions")
      .find({
        customerId: new ObjectId(customerId),
        ...dateMatch,
      })
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      ...transaction,
      _id: transaction._id.toString(),
      customerId: transaction.customerId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch milk customer transactions:", error);
    return [];
  }
}

export async function getMilkCustomerDates(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const milkRecords = await db
      .collection("milk-records")
      .find({
        customerId: new ObjectId(customerId),
        // ...dateMatch,
      })
      .sort({ date: -1 })
      .toArray();

    return {
      milkRecords: milkRecords.map((record) => ({
        ...record,
        _id: record._id.toString(),
        customerId: record.customerId.toString(),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch milk customer year and months", error);
    throw new Error("Failed to fetch milk customer  year and months");
  }
}
