"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function getCustomerSummary(customerId: string, year?: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    let dateMatch = {};
    if (year && year !== "all") {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      dateMatch = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const customer = await db
      .collection("customers")
      .findOne({ _id: new ObjectId(customerId) });

    const works = await db
      .collection("works")
      .aggregate([
        {
          $match: {
            customerId: new ObjectId(customerId),
            ...dateMatch,
          },
        },
        {
          $lookup: {
            from: "tractors",
            localField: "tractorId",
            foreignField: "_id",
            as: "tractor",
          },
        },
        {
          $set: {
            tractor: {
              $cond: {
                if: { $eq: [{ $size: "$tractor" }, 0] },
                then: null,
                else: { $arrayElemAt: ["$tractor", 0] },
              },
            },
          },
        },
        { $sort: { date: -1 } },
      ])
      .toArray();

    const transactions = await db
      .collection("transactions")
      .find({
        customerId: new ObjectId(customerId),
        ...dateMatch,
      })
      .sort({ date: -1 })
      .toArray();
    const totalDebit = transactions.reduce(
      (sum, transaction) =>
        sum + (transaction.type === "DEBIT" ? transaction.amount : 0),
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
      works,
      transactions,
      summary: {
        totalDebit,
        totalPaid,
        balance,
      },
    };
  } catch (error) {
    console.error("Failed to fetch customer summary:", error);
    throw new Error("Failed to fetch customer summary");
  }
}

export async function getAllCustomers() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const customers = await db
      .collection("customers")
      .find({})
      .sort({ name: 1 })
      .toArray();

    // Serialize the MongoDB documents
    return customers.map((customer) => ({
      _id: customer._id.toString(),
      name: customer.name,
      totalDebit: customer.totalDebit,
      totalPaid: customer.totalPaid,
      createdAt: customer.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function getCustomerName(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const customer = await db
      .collection("customers")
      .findOne({ _id: new ObjectId(customerId) });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return {
      ...customer,
    };
  } catch (error) {
    console.error("Failed to fetch customer detail:", error);
    throw new Error("Failed to fetch customer detail");
  }
}

export async function getCustomerAvailableYears(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get unique years from both works and transactions
    const [workYears, transactionYears] = await Promise.all([
      db
        .collection("works")
        .distinct("date", { customerId: new ObjectId(customerId) }),
      db
        .collection("transactions")
        .distinct("date", { customerId: new ObjectId(customerId) }),
    ]);

    // Combine years from both collections and get unique years
    const allDates = [...workYears, ...transactionYears];
    const uniqueYears = Array.from(
      new Set(allDates.map((date) => new Date(date).getFullYear()))
    ).sort((a, b) => b - a); // Sort years in descending order

    return uniqueYears;
  } catch (error) {
    console.error("Failed to fetch customer years:", error);
    return [];
  }
}
