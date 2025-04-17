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
// Part of lib/actions/farmer.ts - only the updated function is shown

export async function getFieldFarmerExpenses(farmerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // First get the field-farmer relationship to find shareType
    const fieldFarmer = await db
      .collection("field_farmers")
      .findOne({ _id: new ObjectId(farmerId) });

    if (!fieldFarmer) {
      throw new Error("Field-farmer relationship not found");
    }

    // Get the expenses
    const expenses = await db
      .collection("field_expenses")
      .find({ farmerId: new ObjectId(farmerId) })
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
          return 33.33;
        case "1/4":
          return 25;
        default:
          return 0;
      }
    };

    // Calculate income split
    const farmerSharePercentage = getSharePercentage(fieldFarmer.shareType);
    const farmerIncome = Math.round(
      (totalIncome * farmerSharePercentage) / 100
    );
    const ownerIncome = totalIncome - farmerIncome;

    return {
      expenses: mappedExpenses,
      summary: {
        totalFarmerExpenses: Math.round(totalFarmerExpenses),
        totalOwnerExpenses: Math.round(totalOwnerExpenses),
        totalIncome: totalIncome,
        farmerIncome: farmerIncome,
        ownerIncome: ownerIncome,
        farmerSharePercentage: farmerSharePercentage,
      },
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
