"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function getCustomerSummary(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const customer = await db
      .collection("customers")
      .findOne({ _id: new ObjectId(customerId) });

    const works = await db
      .collection("works")
      .aggregate([
        { $match: { customerId: new ObjectId(customerId) } },
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
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // console.log("Found works:", works);
    // console.log("Sample work tractorId:", works[0]?.tractorId);
    // console.log("Sample work tractor:", works[0]?.tractor);

    const transactions = await db
      .collection("transactions")
      .find({ customerId: new ObjectId(customerId) })
      .sort({ date: -1 })
      .toArray();

    return {
      customer,
      works,
      transactions,
      summary: {
        totalDebit: customer?.totalDebit || 0,
        totalPaid: customer?.totalPaid || 0,
        balance: (customer?.totalDebit || 0) - (customer?.totalPaid || 0),
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
    return customers.map(customer => ({
      _id: customer._id.toString(),
      name: customer.name,
      totalDebit: customer.totalDebit,
      totalPaid: customer.totalPaid,
      createdAt: customer.createdAt.toISOString()
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
