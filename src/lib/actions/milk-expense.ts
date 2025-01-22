"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { MongoDBFilter } from "../type-definitions";

export async function getMilkExpenses(year?: string, month?: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

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
        { $sort: { date: -1 } },
      ])
      .toArray();

    return expenses.map((expense) => ({
      ...expense,
      amount: expense.amount,
      date: expense.date,
      _id: expense._id.toString(),
      typeId: expense.typeId.toString(),
      type: {
        ...expense.type,
        _id: expense.type._id.toString(),
      },
    }));
  } catch (error) {
    console.error("Failed to fetch milk expenses:", error);
    return [];
  }
}

export async function getMilkExpenseYearsAndMonths() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const dates = await db.collection("milk_expenses").distinct("date");

    // Create a map to store months for each year
    const yearMonthMap = new Map<number, Set<number>>();

    dates.forEach((date: string | Date) => {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1; // Adding 1 since getMonth() returns 0-11

      if (!yearMonthMap.has(year)) {
        yearMonthMap.set(year, new Set<number>());
      }
      yearMonthMap.get(year)?.add(month);
    });

    // Convert the map to the desired format
    const result = Array.from(yearMonthMap.entries()).map(([year, months]) => ({
      year,
      months: Array.from(months).sort((a: number, b: number) => a - b),
    }));

    // Sort years in descending order
    return result.sort(
      (a: { year: number }, b: { year: number }) => b.year - a.year
    );
  } catch (error) {
    console.error("Failed to fetch milk expense years:", error);
    return [];
  }
}

export async function getMilkExpenseTypes() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const types = await db
      .collection("milk_expense_types")
      .find({})
      .sort({ name: 1 })
      .toArray();

    return types.map((type) => ({
      _id: type._id.toString(),
      name: type.name,
    }));
  } catch (error) {
    console.error("Failed to fetch milk expense types:", error);
    return [];
  }
}

export async function addMilkExpenseType(name: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Check if type already exists
    const existingType = await db
      .collection("milk_expense_types")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingType) {
      return { success: false, error: "This expense type already exists" };
    }

    await db.collection("milk_expense_types").insertOne({
      name,
      createdAt: new Date(),
    });

    revalidatePath("/milk/expenses/add");
    return { success: true };
  } catch (error) {
    console.error("Failed to add milk expense type:", error);
    return { success: false, error: "Failed to add expense type" };
  }
}

export async function addMilkExpense({
  typeId,
  amount,
  date,
}: {
  typeId: string;
  amount: number;
  date: Date;
}) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db.collection("milk_expenses").insertOne({
      typeId: new ObjectId(typeId),
      amount,
      date: new Date(date),
      createdAt: new Date(),
    });

    revalidatePath("/milk/expenses");
    return { success: true };
  } catch (error) {
    console.error("Failed to add milk expense:", error);
    return { success: false, error: "Failed to add expense" };
  }
}

export async function deleteMilkExpense(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db.collection("milk_expenses").deleteOne({
      _id: new ObjectId(id),
    });

    revalidatePath("/milk/expenses");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete milk expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}

export async function updateMilkExpense(
  expenseId: string,
  {
    typeId,
    amount,
    date,
  }: {
    typeId: string;
    amount: number;
    date: Date;
  }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db.collection("milk_expenses").updateOne(
      { _id: new ObjectId(expenseId) },
      {
        $set: {
          typeId: new ObjectId(typeId),
          amount,
          date: new Date(date),
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/milk/expenses");
    return { success: true };
  } catch (error) {
    console.error("Failed to update milk expense:", error);
    return { success: false, error: "Failed to update expense" };
  }
}
