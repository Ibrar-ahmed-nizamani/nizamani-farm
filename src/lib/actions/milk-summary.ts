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
    // const workerCredits = await db
    //   .collection("milk_worker_transactions")
    //   .aggregate([
    //     {
    //       $match: {
    //         ...dateFilter,
    //         type: "credit",
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "milk_workers",
    //         localField: "workerId",
    //         foreignField: "_id",
    //         as: "worker",
    //       },
    //     },
    //     { $unwind: "$worker" },
    //   ])
    //   .toArray();

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
        // ...workerCredits.map((credit) => new Date(credit.date).getFullYear()),
        ...customerRecords.map((record) => new Date(record.date).getFullYear()),
      ])
    ).sort((a, b) => b - a);

    // Get available months for selected year
    const months = year
      ? Array.from(
          new Set([
            ...expenses.map((exp) => new Date(exp.date).getMonth() + 1),
            // ...workerCredits.map(
            //   (credit) => new Date(credit.date).getMonth() + 1
            // ),
            ...customerRecords.map(
              (record) => new Date(record.date).getMonth() + 1
            ),
          ])
        ).sort((a, b) => a - b)
      : [];

    return {
      expenses: expenses.map((exp) => ({
        ...exp,
        amount: exp.amount,
        date: exp.date,
        _id: exp._id.toString(),
        typeId: exp.typeId.toString(),
        type: {
          ...exp.type,
          name: exp.type.name,
          _id: exp.type._id.toString(),
        },
      })),
      // workerCredits: workerCredits.map((credit) => ({
      //   ...credit,
      //   _id: credit._id.toString(),
      //   workerId: credit.workerId.toString(),
      //   type: credit.type,
      //   amount: credit.amount,
      //   date: credit.date,
      //   description: credit.description,
      //   worker: {
      //     ...credit.worker,
      //     _id: credit.worker._id.toString(),
      //   },
      // })),
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

export async function getMilkSummaryYearsAndMonths() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get dates from all three collections
    const expenseDates = await db.collection("milk_expenses").distinct("date");
    const workerDates = await db
      .collection("milk_worker_transactions")
      .distinct("date");
    const recordDates = await db.collection("milk-records").distinct("date");

    // Create a map to store months for each year
    const yearMonthMap = new Map<number, Set<number>>();

    // Helper function to process dates
    const processDate = (date: string | Date) => {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1; // Adding 1 since getMonth() returns 0-11

      if (!yearMonthMap.has(year)) {
        yearMonthMap.set(year, new Set<number>());
      }
      yearMonthMap.get(year)?.add(month);
    };

    // Process dates from all collections
    [...expenseDates, ...workerDates, ...recordDates].forEach(processDate);

    // Convert the map to the desired format and sort
    const result = Array.from(yearMonthMap.entries())
      .map(([year, months]) => ({
        year,
        months: Array.from(months).sort((a: number, b: number) => a - b),
      }))
      .sort((a, b) => b.year - a.year);

    return result;
  } catch (error) {
    console.error("Failed to fetch milk data years and months:", error);
    return [];
  }
}
