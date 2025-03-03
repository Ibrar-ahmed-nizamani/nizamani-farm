"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addTractorExpense(
  prevState: unknown,
  formData: FormData
) {
  const tractorId = formData.get("tractorId") as string;
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const amount = parseFloat(formData.get("amount") as string);
    const date = new Date(formData.get("date") as string);
    const description = formData.get("description") as string;

    await db.collection("tractorExpenses").insertOne({
      tractorId: new ObjectId(tractorId),
      amount,
      date,
      description,
      createdAt: new Date(),
    });

    revalidatePath(`/tractor/${tractorId}`);
    revalidatePath(`/tractor/${tractorId}/expenses`);
  } catch (error) {
    console.error("Failed to add expense:", error);
    return { success: false, message: "Failed to add expense" };
  }
  redirect(`/tractor/${tractorId}/expenses`);
}

export async function getTractorExpenses(tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const expenses = await db
      .collection("tractorExpenses")
      .find({ tractorId: new ObjectId(tractorId) })
      .sort({ date: -1 })
      .toArray();

    return expenses.map((expense) => ({
      _id: expense._id.toString(),
      description: expense.description,
      amount: expense.amount,
      date: expense.date.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

export async function deleteTractorExpense(
  expenseId: string,
  tractorId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db
      .collection("tractorExpenses")
      .deleteOne({ _id: new ObjectId(expenseId) });

    revalidatePath(`/tractor/${tractorId}`);
    revalidatePath(`/tractor/${tractorId}/expenses`);
    return { success: true, message: "Expense deleted successfully" };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, message: "Failed to delete expense" };
  }
}

export async function getAllTractorExpenses(
  tractorId: string,
  filters?: {
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const query: { tractorId: ObjectId; date?: any } = {
      tractorId: new ObjectId(tractorId),
    };

    // Apply date filters
    if (filters) {
      const { year, month, startDate, endDate } = filters;

      if (startDate || endDate) {
        // Use date range if explicit start/end dates are provided
        query.date = {};

        if (startDate) {
          query.date.$gte = new Date(startDate);
        }

        if (endDate) {
          query.date.$lte = new Date(endDate);
        }
      } else if (year && year !== "all") {
        // If year is specified but no explicit date range
        if (month && month !== "all") {
          // If both year and month are specified
          const monthInt = parseInt(month);
          const yearInt = parseInt(year);

          const startOfMonth = new Date(yearInt, monthInt - 1, 1);
          const endOfMonth = new Date(yearInt, monthInt, 0);

          query.date = {
            $gte: startOfMonth,
            $lte: endOfMonth,
          };
        } else {
          // If only year is specified
          query.date = {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          };
        }
      }
    }

    const expenses = await db
      .collection("tractorExpenses")
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return expenses.map((expense) => ({
      _id: expense._id.toString(),
      description: expense.description,
      amount: expense.amount,
      date: expense.date.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

export async function getExpenseYears(tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const years = await db
      .collection("tractorExpenses")
      .distinct("date", { tractorId: new ObjectId(tractorId) });

    return Array.from(
      new Set(years.map((date) => new Date(date).getFullYear()))
    ).sort((a, b) => b - a);
  } catch (error) {
    console.error("Failed to fetch expense years:", error);
    return [];
  }
}

export async function updateTractorExpense(
  expenseId: string,
  tractorId: string,
  updatedData: { amount: number; description: string; date: Date }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Update the expense
    await db.collection("tractorExpenses").updateOne(
      { _id: new ObjectId(expenseId) },
      {
        $set: {
          amount: updatedData.amount,
          description: updatedData.description,
          date: updatedData.date,
        },
      }
    );

    revalidatePath(`/tractor/${tractorId}`);
    revalidatePath(`/tractor/${tractorId}/expenses`);
    return { success: true, message: "Expense updated successfully" };
  } catch (error) {
    console.error("Failed to update expense:", error);
    return { success: false, message: "Failed to update expense" };
  }
}

export async function getExpenseAvailableMonths(tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const expenses = await db
      .collection("tractorExpenses")
      .find({ tractorId: new ObjectId(tractorId) })
      .toArray();

    // Extract unique month/year combinations
    const months = expenses.map((expense) => {
      const date = new Date(expense.date);
      return {
        month: date.getMonth() + 1, // JS months are 0-indexed
        year: date.getFullYear(),
      };
    });

    // Create a unique set of month/year combinations
    const uniqueMonths = Array.from(
      new Set(
        months.map((m) => `${m.year}-${m.month.toString().padStart(2, "0")}`)
      )
    )
      .map((dateStr) => {
        const [year, month] = dateStr.split("-").map(Number);
        return { month, year };
      })
      .sort((a, b) => {
        // Sort by year (descending) then by month (descending)
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    return uniqueMonths;
  } catch (error) {
    console.error("Failed to fetch expense months:", error);
    return [];
  }
}
