"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getMilkData(year?: string, month?: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Build date filter
    interface DateFilter {
      date?: {
        $gte: Date;
        $lt: Date;
      };
    }

    const dateFilter: DateFilter = {};
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

    const milkData = await db
      .collection("milk")
      .find(dateFilter)
      .sort({ date: -1 })
      .toArray();

    return milkData.map((record) => ({
      _id: record._id.toString(),
      date: record.date,
      amMilk: record.amMilk,
      pmMilk: record.pmMilk,
    }));
  } catch (error) {
    console.error("Failed to fetch milk data:", error);
    return [];
  }
}

export async function getMilkYearsAndMonths() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get all dates from the collection
    const dates = await db.collection("milk").distinct("date");

    // Create a map to store months for each year
    const yearMonthMap = new Map<number, Set<number>>();

    // Process each date to organize years and months
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
    console.error("Failed to fetch milk years and months:", error);
    return [];
  }
}

export async function addMilkRecord({
  date,
  amMilk,
  pmMilk,
}: {
  date: Date;
  amMilk: number;
  pmMilk: number;
}) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Create start and end of day dates without modifying the original date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if record already exists for this date
    const existingRecord = await db.collection("milk").findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingRecord) {
      return {
        success: false,
        error: "A milk record already exists for this date",
      };
    }

    // If no existing record, add the new one
    const result = await db.collection("milk").insertOne({
      date: new Date(date), // Create a new Date object to avoid any mutations
      amMilk,
      pmMilk,
      createdAt: new Date(),
    });

    if (!result.acknowledged) {
      return { success: false, error: "Failed to insert record" };
    }

    revalidatePath("/milk");
    return { success: true };
  } catch (error) {
    console.error("Failed to add milk record:", error);
    return { success: false, error: "Failed to add milk record" };
  }
}

export async function deleteMilkRecord(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db.collection("milk").deleteOne({ _id: new ObjectId(id) });

    revalidatePath("/milk");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete milk record:", error);
    return { success: false, error: "Failed to delete milk record" };
  }
}
// In milk.ts

export async function updateMilkRecord(
  recordId: string,
  {
    date,
    amMilk,
    pmMilk,
  }: {
    date: Date;
    amMilk: number;
    pmMilk: number;
  }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Create start and end of day dates for checking duplicates
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if another record exists for this date (excluding the current record)
    const existingRecord = await db.collection("milk").findOne({
      _id: { $ne: new ObjectId(recordId) }, // Exclude current record
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingRecord) {
      return {
        success: false,
        error: "Another milk record already exists for this date",
      };
    }

    // Update the record
    const result = await db.collection("milk").updateOne(
      { _id: new ObjectId(recordId) },
      {
        $set: {
          date: new Date(date),
          amMilk,
          pmMilk,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return { success: false, error: "Record not found" };
    }

    revalidatePath("/milk");
    return { success: true };
  } catch (error) {
    console.error("Failed to update milk record:", error);
    return { success: false, error: "Failed to update milk record" };
  }
}
