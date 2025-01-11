// milk-summary-actions.ts
"use server";

import clientPromise from "@/lib/mongodb";
import { MongoDBFilter } from "../type-definitions";



export async function getMilkSummaryData(year?: string, month?: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Build date filter
    const dateFilter: MongoDBFilter = {};
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

    // Get expenses
    const expenses = await db
      .collection("milk_expenses")
      .aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: "milk_expense_types",
            localField: "typeId",
            foreignField: "_id",
            as: "type",
          },
        },
        { $unwind: "$type" },
      ])
      .toArray();

    // Get worker credits
    const workerCredits = await db
      .collection("milk_worker_transactions")
      .aggregate([
        {
          $match: {
            ...dateFilter,
            type: "credit",
          },
        },
        {
          $lookup: {
            from: "milk_workers",
            localField: "workerId",
            foreignField: "_id",
            as: "worker",
          },
        },
        { $unwind: "$worker" },
      ])
      .toArray();

    // Get customer records (income)
    const customerRecords = await db
      .collection("milk-records")
      .aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: "milk-customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
      ])
      .toArray();

    // Get available years
    const years = await db.collection("milk_expenses").distinct("date");

    const allYears = Array.from(
      new Set([
        ...years.map((date) => new Date(date).getFullYear()),
        ...workerCredits.map((credit) => new Date(credit.date).getFullYear()),
        ...customerRecords.map((record) => new Date(record.date).getFullYear()),
      ])
    ).sort((a, b) => b - a);

    // Get available months for selected year
    const months = year
      ? Array.from(
          new Set([
            ...expenses.map((exp) => new Date(exp.date).getMonth() + 1),
            ...workerCredits.map(
              (credit) => new Date(credit.date).getMonth() + 1
            ),
            ...customerRecords.map(
              (record) => new Date(record.date).getMonth() + 1
            ),
          ])
        ).sort((a, b) => a - b)
      : [];

    return {
      expenses: expenses.map((exp) => ({
        ...exp,
        _id: exp._id.toString(),
        typeId: exp.typeId.toString(),
        type: {
          ...exp.type,
          _id: exp.type._id.toString(),
        },
      })),
      workerCredits: workerCredits.map((credit) => ({
        ...credit,
        _id: credit._id.toString(),
        workerId: credit.workerId.toString(),
        worker: {
          ...credit.worker,
          _id: credit.worker._id.toString(),
        },
      })),
      customerRecords: customerRecords.map((record) => ({
        _id: record._id?.toString(),
        customerId: record.customerId?.toString(),
        date: record.date?.toISOString(),
        quantity: record.quantity,
        price: record.price,
        amount: record.amount,
        createdAt: record.createdAt?.toISOString(),
        customerName: record.customer?.name || record.customerName,
      })),
      years: allYears,
      months,
    };
  } catch (error) {
    console.error("Failed to fetch milk summary data:", error);
    return {
      expenses: [],
      workerCredits: [],
      customerRecords: [],
      years: [],
      months: [],
    };
  }
}
