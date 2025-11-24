// lib/actions/farmer.ts
"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { convertShareTypes } from "../utils";

export async function addFarmerToField(
  fieldId: string,
  farmerName: string,
  shareType: "1/3" | "1/2" | "1/4",
  allocatedArea: number
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Verify field exists and check remaining area
    const field = await db
      .collection("fields")
      .findOne({ _id: new ObjectId(fieldId) });

    if (!field) {
      return {
        success: false,
        error: "Field not found",
      };
    }

    // Check if allocated area is more than remaining area
    if (allocatedArea > field.remainingArea) {
      return {
        success: false,
        error: `Cannot allocate more than remaining area (${field.remainingArea})`,
      };
    }

    // Check if farmer exists by name
    let farmer = await db.collection("farmers").findOne({ name: farmerName });

    // If farmer doesn't exist, create new farmer
    if (!farmer) {
      const result = await db.collection("farmers").insertOne({
        name: farmerName,
        allocatedArea: allocatedArea,
        fieldExpenses: 0,
        debit: 0,
        credit: 0,
        createdAt: new Date(),
      });
      farmer = {
        _id: result.insertedId,
        name: farmerName,
        allocatedArea: allocatedArea,
        fieldExpenses: 0,
        debit: 0,
        credit: 0,
      };
    } else {
      // Update existing farmer with new fields if they don't exist
      await db.collection("farmers").updateOne(
        { _id: farmer._id },
        {
          $set: {
            allocatedArea: farmer.allocatedArea || allocatedArea,
            fieldExpenses: farmer.fieldExpenses || 0,
            debit: farmer.debit || 0,
            credit: farmer.credit || 0,
          },
        }
      );
    }

    // Check if farmer is already assigned to this field
    const existingAssignment = await db.collection("field_farmers").findOne({
      fieldId: new ObjectId(fieldId),
      farmerId: farmer._id,
    });

    if (existingAssignment) {
      return {
        success: false,
        error: "Farmer is already assigned to this field",
      };
    }

    // Update remaining area
    await db
      .collection("fields")
      .updateOne(
        { _id: new ObjectId(fieldId) },
        { $inc: { remainingArea: -allocatedArea } }
      );

    // Add farmer to field
    await db.collection("field_farmers").insertOne({
      fieldId: new ObjectId(fieldId),
      farmerId: farmer._id,
      shareType,
      allocatedArea,
      fieldExpenses: 0,
      debit: 0,
      credit: 0,
      startDate: new Date(),
      createdAt: new Date(),
    });

    revalidatePath(`/fields/${fieldId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add farmer to field:", error);
    return {
      success: false,
      error: "Failed to add farmer to field",
    };
  }
}

export async function getFieldFarmer(farmerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the field-farmer relationship first
    const fieldFarmer = await db
      .collection("field_farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    if (!fieldFarmer) {
      throw new Error("Field-farmer relationship not found");
    }

    // Get the actual farmer details to retrieve the name
    const farmer = await db
      .collection("farmers")
      .findOne({ _id: fieldFarmer.farmerId });

    if (!farmer) {
      throw new Error("Farmer not found");
    }

    // Get field details
    const field = await db
      .collection("fields")
      .findOne({ _id: fieldFarmer.fieldId });

    return {
      name: farmer.name,
      allocatedArea: fieldFarmer.allocatedArea,
      shareType: fieldFarmer.shareType,
      fieldId: fieldFarmer.fieldId.toString(),
      fieldName: field ? field.name : "Unknown Field",
      _id: fieldFarmer._id.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch field farmer:", error);
    throw new Error("Failed to fetch field farmer");
  }
}

interface DateFilterOptions {
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  expenseType?: string;
}

export async function getFieldFarmerExpenses(
  farmerId: string,
  filterOptions: DateFilterOptions = {}
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the field-farmer relationship
    const fieldFarmer = await db
      .collection("field_farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    if (!fieldFarmer) {
      throw new Error("Field-farmer relationship not found");
    }

    // Build query with date filter if provided
    const query: any = {
      fieldId: fieldFarmer.fieldId,
      farmerId: new ObjectId(farmerId),
    };

    const { year, month, startDate, endDate, expenseType } = filterOptions;

    // Expense type filter
    if (expenseType && expenseType !== "all") {
      query.expenseType = expenseType;
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      // Set start date to beginning of day
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end,
      };
    }
    // Year and month filter
    else if (year && year !== "all") {
      if (month && month !== "all") {
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        const startOfMonth = new Date(yearNum, monthNum - 1, 1);
        const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

        query.date = {
          $gte: startOfMonth,
          $lte: endOfMonth,
        };
      } else {
        query.date = {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        };
      }
    }

    // Get all expenses for this field and farmer with optional date filter
    const expenses = await db
      .collection("field_expenses")
      .find(query)
      .sort({ date: -1 })
      .toArray();
    // Get share settings for this farmer's share type
    const shareSettings = await db
      .collection("share_settings")
      .find({ shareType: convertShareTypes(fieldFarmer.shareType) })
      .toArray();

    // Create a map of expense types to their share percentages
    const expenseShareMap: Record<string, number> = {};

    shareSettings.forEach((setting) => {
      expenseShareMap[setting.name] = setting.farmerExpenseSharePercentage;
    });

    // Calculate total farmer expenses and owner expenses
    let totalFarmerExpenses = 0;
    let totalOwnerExpenses = 0;
    let totalIncome = 0;

    const mappedExpenses = expenses.map((expense) => {
      // Calculate expense share
      const sharePercentage =
        expense.type === "expense" &&
        expense.expenseType &&
        expenseShareMap[expense.expenseType]
          ? expenseShareMap[expense.expenseType]
          : 0;

      // Only calculate for expense types, not income
      if (expense.type === "expense") {
        const farmerShare = (expense.amount * sharePercentage) / 100;
        const ownerShare = expense.amount - farmerShare;

        totalFarmerExpenses += farmerShare;
        totalOwnerExpenses += ownerShare;
      } else if (expense.type === "income") {
        totalIncome += expense.amount;
      }

      return {
        _id: expense._id.toString(),
        farmerId: expense.farmerId.toString(),
        type: expense.type,
        expenseType: expense.expenseType,
        expenseTypeId: expense.expenseTypeId
          ? expense.expenseTypeId.toString()
          : "",
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        sharePercentage: sharePercentage || null,
      };
    });

    // Function to get income share percentage based on share type
    const getSharePercentage = (shareType: string): number => {
      switch (shareType) {
        case "1/2":
          return 50;
        case "1/3":
          return 100 / 3;
        case "1/4":
          return 25;
        default:
          return 0;
      }
    };

    // Calculate income split
    const farmerSharePercentage = getSharePercentage(fieldFarmer.shareType);
    const farmerIncome = (totalIncome * farmerSharePercentage) / 100;
    const ownerIncome = totalIncome - farmerIncome;

    // Get unique years and months for the filter
    const years = Array.from(
      new Set(expenses.map((expense) => new Date(expense.date).getFullYear()))
    ).sort((a, b) => b - a); // Sort in descending order

    // Get available months
    const monthsMap = new Map<number, Set<number>>();
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (!monthsMap.has(year)) {
        monthsMap.set(year, new Set());
      }
      monthsMap.get(year)?.add(month);
    });

    const months = Array.from(monthsMap.entries())
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

    return {
      expenses: mappedExpenses,
      summary: {
        totalFarmerExpenses: totalFarmerExpenses,
        totalOwnerExpenses: totalOwnerExpenses,
        totalIncome: totalIncome,
        farmerIncome: farmerIncome,
        ownerIncome: ownerIncome,
        farmerSharePercentage: farmerSharePercentage,
      },
      years,
      months,
    };
  } catch (error) {
    console.error("Failed to fetch field farmer expenses:", error);
    return {
      expenses: [],
      summary: {
        totalFarmerExpenses: 0,
        totalOwnerExpenses: 0,
        totalIncome: 0,
        farmerIncome: 0,
        ownerIncome: 0,
        farmerSharePercentage: 0,
      },
      years: [],
      months: [],
    };
  }
}

export async function getFarmerTransactions(
  farmerId: string,
  year?: string,
  month?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    interface DateFilter {
      farmerId: ObjectId;
      date?: {
        $gte: Date;
        $lt: Date;
      };
    }

    const dateFilter: DateFilter = {
      farmerId: new ObjectId(farmerId),
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
      .collection("farmer_transactions")
      .find(dateFilter)
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      _id: transaction._id.toString(),
      farmerId: transaction.farmerId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch farmer transactions:", error);
    return [];
  }
}

export async function getFarmerTransactionDates(farmerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const transactions = await db
      .collection("farmer_transactions")
      .find({ farmerId: new ObjectId(farmerId) })
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      date: transaction.date,
      _id: transaction._id.toString(),
      farmerId: transaction.farmerId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch farmer transaction dates:", error);
    return [];
  }
}

export async function addFarmerTransaction(
  farmerId: string,
  type: "debit" | "credit",
  amount: number,
  date: Date,
  description: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Verify farmer exists
    const farmer = await db
      .collection("field_farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    if (!farmer) {
      return {
        success: false,
        error: "Farmer not found",
      };
    }

    await db.collection("farmer_transactions").insertOne({
      farmerId: new ObjectId(farmerId),
      type,
      amount,
      date: new Date(date),
      description,
      createdAt: new Date(),
    });

    revalidatePath(
      `/fields/${farmer.fieldId}/farmers/${farmerId}/transactions`
    );
    return { success: true };
  } catch (error) {
    console.error("Failed to add farmer transaction:", error);
    return {
      success: false,
      error: "Failed to add transaction",
    };
  }
}

// Additions to lib/actions/farmer.ts

export async function updateFarmerTransaction(
  farmerId: string,
  transactionId: string,
  type: "debit" | "credit",
  amount: number,
  date: Date,
  description: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the field-farmer relationship to get the fieldId for revalidation
    const fieldFarmer = await db
      .collection("field_farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    if (!fieldFarmer) {
      return {
        success: false,
        error: "Farmer not found",
      };
    }

    // Update the transaction
    const result = await db.collection("farmer_transactions").updateOne(
      { _id: new ObjectId(transactionId), farmerId: new ObjectId(farmerId) },
      {
        $set: {
          type,
          amount,
          date: new Date(date),
          description,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    // Revalidate the page
    revalidatePath(
      `/fields/${fieldFarmer.fieldId}/farmers/${farmerId}/transactions`
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update farmer transaction:", error);
    return {
      success: false,
      error: "Failed to update transaction",
    };
  }
}

export async function deleteFarmerTransaction(
  farmerId: string,
  transactionId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the field-farmer relationship to get the fieldId for revalidation
    const fieldFarmer = await db
      .collection("field_farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    if (!fieldFarmer) {
      return {
        success: false,
        error: "Farmer not found",
      };
    }

    // Delete the transaction
    const result = await db.collection("farmer_transactions").deleteOne({
      _id: new ObjectId(transactionId),
      farmerId: new ObjectId(farmerId),
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    // Revalidate the page
    revalidatePath(
      `/fields/${fieldFarmer.fieldId}/farmers/${farmerId}/transactions`
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to delete farmer transaction:", error);
    return {
      success: false,
      error: "Failed to delete transaction",
    };
  }
}

export async function updateFarmer(
  fieldId: string,
  farmerId: string,
  farmerName: string,
  shareType: "1/3" | "1/2" | "1/4",
  allocatedArea: number
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the current field-farmer relationship
    const currentFieldFarmer = await db
      .collection("field_farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    if (!currentFieldFarmer) {
      return {
        success: false,
        error: "Farmer not found",
      };
    }

    // Get the field to check remaining area
    const field = await db
      .collection("fields")
      .findOne({ _id: new ObjectId(fieldId) });

    if (!field) {
      return {
        success: false,
        error: "Field not found",
      };
    }

    // Calculate the difference in allocated area
    const areaDifference = allocatedArea - currentFieldFarmer.allocatedArea;

    // Check if the new allocated area would exceed the field's remaining area
    if (areaDifference > field.remainingArea) {
      return {
        success: false,
        error: `Cannot allocate more than remaining area (${
          field.remainingArea + currentFieldFarmer.allocatedArea
        } acres)`,
      };
    }

    // Get the farmer document to update the name
    const farmer = await db
      .collection("farmers")
      .findOne({ _id: currentFieldFarmer.farmerId });

    if (!farmer) {
      return {
        success: false,
        error: "Farmer record not found",
      };
    }

    // Update the farmer's name
    await db.collection("farmers").updateOne(
      { _id: farmer._id },
      {
        $set: {
          name: farmerName,
        },
      }
    );

    // Update the field-farmer relationship
    await db.collection("field_farmers").updateOne(
      { _id: new ObjectId(farmerId) },
      {
        $set: {
          shareType,
          allocatedArea,
          updatedAt: new Date(),
        },
      }
    );

    // Update the field's remaining area
    await db
      .collection("fields")
      .updateOne(
        { _id: new ObjectId(fieldId) },
        { $inc: { remainingArea: -areaDifference } }
      );

    revalidatePath(`/fields/${fieldId}`);
    revalidatePath(`/fields/${fieldId}/farmers/${farmerId}`);
    revalidatePath(`/fields`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update farmer:", error);
    return {
      success: false,
      error: "Failed to update farmer",
    };
  }
}

export async function deleteFarmer(farmerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the field-farmer relationship to get the fieldId for revalidation
    const fieldFarmer = await db
      .collection("field_farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    if (!fieldFarmer) {
      return {
        success: false,
        error: "Farmer not found",
      };
    }

    const fieldId = fieldFarmer.fieldId;

    // Update the field's remaining area
    await db
      .collection("fields")
      .updateOne(
        { _id: fieldId },
        { $inc: { remainingArea: fieldFarmer.allocatedArea } }
      );

    // Delete all transactions related to this farmer
    await db.collection("farmer_transactions").deleteMany({
      farmerId: new ObjectId(farmerId),
    });

    // Delete the field-farmer relationship
    const result = await db.collection("field_farmers").deleteOne({
      _id: new ObjectId(farmerId),
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Failed to delete farmer",
      };
    }

    // Note: We don't delete the actual farmer document as it might be referenced elsewhere

    revalidatePath(`/fields/${fieldId}`);
    revalidatePath(`/fields/${fieldId}/farmers/${farmerId}`);
    revalidatePath(`/fields`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete farmer:", error);
    return {
      success: false,
      error: "Failed to delete farmer",
    };
  }
}
