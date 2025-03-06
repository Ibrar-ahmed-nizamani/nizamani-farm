// milk-summary-actions.ts
"use server";

import clientPromise from "@/lib/mongodb";
import { MongoDBFilter } from "../type-definitions";

interface DateFilterOptions {
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  date?: string; // Keep existing date param for backward compatibility
}

export async function getMilkSummaryData(
  filterOptions: DateFilterOptions = {}
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Explicit date filter construction
    const buildMatchStage = (collection: string) => {
      const { year, month, startDate, endDate, date } = filterOptions;
      const matchConditions: any = {};

      // Date range filter
      if (startDate || endDate) {
        matchConditions.date = {};
        if (startDate) {
          matchConditions.date.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchConditions.date.$lte = end;
        }
      }
      // Specific date filter
      else if (date) {
        if (date === "today") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          matchConditions.date = {
            $gte: today,
            $lt: tomorrow,
          };
        } else {
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);

          matchConditions.date = {
            $gte: selectedDate,
            $lt: nextDay,
          };
        }
      }
      // Year and month filter
      else if (year && year !== "all") {
        if (month && month !== "all") {
          const monthNum = parseInt(month);
          const yearNum = parseInt(year);

          const startOfMonth = new Date(yearNum, monthNum - 1, 1);
          const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

          matchConditions.date = {
            $gte: startOfMonth,
            $lte: endOfMonth,
          };
        } else {
          matchConditions.date = {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          };
        }
      }

      // For milk-transactions, add type filter for debits
      if (collection === "milk-transactions") {
        matchConditions.type = "DEBIT";
      }

      return Object.keys(matchConditions).length > 0
        ? { $match: matchConditions }
        : { $match: {} };
    };

    // Get expenses
    const expenses = await db
      .collection("milk_expenses")
      .aggregate([
        buildMatchStage("milk_expenses"),
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

    // Get customer records (milk income)
    const customerRecords = await db
      .collection("milk-records")
      .aggregate([
        buildMatchStage("milk-records"),
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

    // Get customer debits
    const customerDebits = await db
      .collection("milk-transactions")
      .aggregate([
        buildMatchStage("milk-transactions"),
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

    // Calculate years and months dynamically
    const years = await getUniqueYears(db);
    const months = await getAvailableMonths(db, years);

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
      customerDebits: customerDebits.map((debit) => ({
        _id: debit._id?.toString(),
        customerId: debit.customerId?.toString(),
        date: debit.date?.toISOString(),
        amount: debit.amount,
        description: debit.description,
        customerName: debit.customer?.name,
      })),
      years,
      months,
    };
  } catch (error) {
    console.error("Failed to fetch milk summary data:", error);
    return {
      expenses: [],
      customerRecords: [],
      customerDebits: [],
      years: [],
      months: [],
    };
  }
}

// Helper function to get unique years dynamically
async function getUniqueYears(db: any) {
  const expenseYears = await db.collection("milk_expenses").distinct("date");
  const recordYears = await db.collection("milk-records").distinct("date");
  const debitYears = await db.collection("milk-transactions").distinct("date");

  return Array.from(
    new Set([
      ...expenseYears.map((date: Date) => new Date(date).getFullYear()),
      ...recordYears.map((date: Date) => new Date(date).getFullYear()),
      ...debitYears.map((date: Date) => new Date(date).getFullYear()),
    ])
  ).sort((a, b) => b - a);
}

// Helper function to get available months
async function getAvailableMonths(db: any, years: number[]) {
  const monthsMap = new Map<number, Set<number>>();

  const collections = ["milk_expenses", "milk-records", "milk-transactions"];

  for (const collection of collections) {
    for (const year of years) {
      const dates = await db
        .collection(collection)
        .find({
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        })
        .project({ date: 1 })
        .toArray();

      dates.forEach((item: { date: Date }) => {
        const date = new Date(item.date);
        const month = date.getMonth() + 1;

        if (!monthsMap.has(year)) {
          monthsMap.set(year, new Set());
        }
        monthsMap.get(year)?.add(month);
      });
    }
  }

  return Array.from(monthsMap.entries())
    .flatMap(([year, months]) =>
      Array.from(months).map((month) => ({
        year,
        month,
        label: new Date(year, month - 1).toLocaleString("default", {
          month: "long",
        }),
      }))
    )
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.month - b.month;
    });
}
