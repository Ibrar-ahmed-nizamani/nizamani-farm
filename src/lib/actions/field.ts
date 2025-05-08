// lib/actions/field.ts
"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function addField(name: string, totalArea: number) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Check if field with same name exists
    const existingField = await db
      .collection("fields")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingField) {
      return {
        success: false,
        error: "A field with this name already exists",
      };
    }

    await db.collection("fields").insertOne({
      name,
      totalArea,
      remainingArea: totalArea, // Initialize remainingArea equal to totalArea
      createdAt: new Date(),
    });

    revalidatePath("/fields");
    return { success: true };
  } catch (error) {
    console.error("Failed to add field:", error);
    return {
      success: false,
      error: "Failed to add field",
    };
  }
}

export async function getRemainingArea(fieldId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const field = await db
      .collection("fields")
      .findOne({ _id: new ObjectId(fieldId) });

    if (!field) {
      throw new Error("Field not found");
    }

    return {
      success: true,
      remainingArea: field.remainingArea,
    };
  } catch (error) {
    console.error("Failed to fetch remaining area:", error);
    return {
      success: false,
      error: "Failed to fetch remaining area",
    };
  }
}

export async function getFields() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const fields = await db
      .collection("fields")
      .find({})
      .sort({ name: 1 })
      .toArray();

    return fields.map((field) => ({
      ...field,
      name: field.name,
      totalArea: field.totalArea,
      _id: field._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch fields:", error);
    return [];
  }
}

export async function getField(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const field = await db
      .collection("fields")
      .findOne({ _id: new ObjectId(id) });

    if (!field) {
      throw new Error("Field not found");
    }

    return {
      ...field,
      totalArea: field.totalArea,
      name: field.name,
      _id: field._id.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch field:", error);
    throw new Error("Failed to fetch field");
  }
}

export async function getFieldFarmers(fieldId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get all farmers for this field
    const fieldFarmers = await db
      .collection("field_farmers")
      .find({ fieldId: new ObjectId(fieldId) })
      .toArray();

    // Get farmer details for each field farmer
    const farmerIds = fieldFarmers.map((ff) => new ObjectId(ff.farmerId));
    const farmers = await db
      .collection("farmers")
      .find({ _id: { $in: farmerIds } })
      .toArray();

    // Create a map of farmer details
    const farmerMap = new Map(farmers.map((f) => [f._id.toString(), f]));

    // Combine field farmer data with farmer details
    return fieldFarmers.map((ff) => ({
      _id: ff._id.toString(),
      fieldId: ff.fieldId.toString(),
      farmerId: ff.farmerId.toString(),
      name: farmerMap.get(ff.farmerId.toString())?.name || "Unknown Farmer",
      shareType: ff.shareType,
      allocatedArea: ff.allocatedArea,
      startDate: ff.startDate,
      endDate: ff.endDate,
      status: ff.status,
      createdAt: ff.createdAt,
    }));
  } catch (error) {
    console.error("Failed to fetch field farmers:", error);
    return [];
  }
}

export async function addFieldExpense(
  fieldId: string,
  farmerId: string,
  data: {
    type: "expense" | "income";
    expenseType?: string;
    amount: number;
    date: Date;
    description: string;
    farmerShare: number;
  }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get expense type details if provided
    let expenseTypeDetails = null;
    if (data.type === "expense" && data.expenseType) {
      expenseTypeDetails = await db
        .collection("share_settings")
        .findOne({ _id: new ObjectId(data.expenseType) });
    }

    // Insert the field expense record
    await db.collection("field_expenses").insertOne({
      fieldId: new ObjectId(fieldId),
      farmerId: new ObjectId(farmerId),
      type: data.type,
      expenseType:
        data.type === "expense"
          ? expenseTypeDetails
            ? expenseTypeDetails.name
            : undefined
          : undefined,
      expenseTypeId:
        data.type === "expense"
          ? data.expenseType
            ? new ObjectId(data.expenseType)
            : undefined
          : undefined,
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
      farmerShare: data.farmerShare,
      createdAt: new Date(),
    });

    revalidatePath(`/fields/${fieldId}/farmers/${farmerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add field expense:", error);
    throw new Error("Failed to add field expense");
  }
}

// Add this to lib/actions/field.ts
export async function getFieldSummary(fieldId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get all farmers for this field
    const fieldFarmers = await db
      .collection("field_farmers")
      .find({ fieldId: new ObjectId(fieldId) })
      .toArray();

    // Get all expenses/income for these farmers
    const farmerIds = fieldFarmers.map((ff) => new ObjectId(ff._id));
    const allExpenses = await db
      .collection("field_expenses")
      .find({ farmerId: { $in: farmerIds } })
      .toArray();

    // Initialize summary values
    let totalExpenses = 0;
    let totalIncome = 0;
    let totalOwnerExpenses = 0;
    let totalFarmerExpenses = 0;
    let totalOwnerIncome = 0;
    let totalFarmerIncome = 0;

    // Get share settings for expense calculations
    const shareSettings = await db
      .collection("share_settings")
      .find({})
      .toArray();

    // Create a map of expense types to their share percentages
    const expenseShareMap: { [key: string]: number } = {};
    shareSettings.forEach((setting) => {
      expenseShareMap[setting.name] = setting.farmerExpenseSharePercentage;
    });

    // Function to get income share percentage based on share type
    const getSharePercentage = (shareType: string) => {
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

    // Create a map of farmer IDs to their share types
    const farmerShareMap: { [key: string]: string } = {};
    fieldFarmers.forEach((ff) => {
      farmerShareMap[ff._id.toString()] = ff.shareType;
    });

    // Calculate totals
    allExpenses.forEach((expense) => {
      const farmerId = expense.farmerId.toString();
      const shareType = farmerShareMap[farmerId];

      if (expense.type === "expense") {
        totalExpenses += expense.amount;

        // Calculate expense share
        const sharePercentage =
          expense.expenseType && expenseShareMap[expense.expenseType]
            ? expenseShareMap[expense.expenseType]
            : 0;

        const farmerShare = (expense.amount * sharePercentage) / 100;
        const ownerShare = expense.amount - farmerShare;

        totalFarmerExpenses += farmerShare;
        totalOwnerExpenses += ownerShare;
      } else if (expense.type === "income") {
        totalIncome += expense.amount;

        // Calculate income share based on farmer's share type
        const farmerSharePercentage = getSharePercentage(shareType);
        const farmerIncome = (expense.amount * farmerSharePercentage) / 100;
        const ownerIncome = expense.amount - farmerIncome;

        totalFarmerIncome += farmerIncome;
        totalOwnerIncome += ownerIncome;
      }
    });

    return {
      success: true,
      summary: {
        totalExpenses: Math.round(totalExpenses),
        totalIncome: Math.round(totalIncome),
        balance: Math.round(totalIncome - totalExpenses),
        totalOwnerExpenses: Math.round(totalOwnerExpenses),
        totalFarmerExpenses: Math.round(totalFarmerExpenses),
        totalOwnerIncome: Math.round(totalOwnerIncome),
        totalFarmerIncome: Math.round(totalFarmerIncome),
        totalOwnerBalance: Math.round(totalOwnerIncome - totalOwnerExpenses),
        totalFarmerBalance: Math.round(totalFarmerIncome - totalFarmerExpenses),
      },
    };
  } catch (error) {
    console.error("Failed to fetch field summary:", error);
    return {
      success: false,
      error: "Failed to fetch field summary",
      summary: {
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
        totalOwnerExpenses: 0,
        totalFarmerExpenses: 0,
        totalOwnerIncome: 0,
        totalFarmerIncome: 0,
        totalOwnerBalance: 0,
        totalFarmerBalance: 0,
      },
    };
  }
}

export async function deleteFieldExpense(
  fieldId: string,
  farmerId: string,
  expenseId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Delete the field expense record
    await db.collection("field_expenses").deleteOne({
      _id: new ObjectId(expenseId),
    });

    revalidatePath(`/fields/${fieldId}/farmers/${farmerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete field expense:", error);
    throw new Error("Failed to delete field expense");
  }
}

export async function updateFieldExpense(
  fieldId: string,
  farmerId: string,
  expenseId: string,
  data: {
    type: "expense" | "income";
    expenseType?: string;
    amount: number;
    date: Date;
    description: string;
    farmerShare: number;
  }
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get expense type details if provided
    let expenseTypeDetails = null;
    if (data.type === "expense" && data.expenseType) {
      expenseTypeDetails = await db
        .collection("share_settings")
        .findOne({ _id: new ObjectId(data.expenseType) });
    }

    // Update the field expense record
    await db.collection("field_expenses").updateOne(
      { _id: new ObjectId(expenseId) },
      {
        $set: {
          fieldId: new ObjectId(fieldId),
          farmerId: new ObjectId(farmerId),
          type: data.type,
          expenseType:
            data.type === "expense" && expenseTypeDetails
              ? expenseTypeDetails.name
              : undefined,
          expenseTypeId:
            data.type === "expense" && data.expenseType
              ? new ObjectId(data.expenseType)
              : undefined,
          amount: data.amount,
          date: new Date(data.date),
          description: data.description,
          farmerShare: data.farmerShare,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath(`/fields/${fieldId}/farmers/${farmerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update field expense:", error);
    throw new Error("Failed to update field expense");
  }
}

export async function updateField(fieldId: string, name: string, totalArea: number) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the current field to calculate area difference
    const currentField = await db
      .collection("fields")
      .findOne({ _id: new ObjectId(fieldId) });

    if (!currentField) {
      return {
        success: false,
        error: "Field not found",
      };
    }

    // Check if name is already used by another field
    if (name !== currentField.name) {
      const existingField = await db
        .collection("fields")
        .findOne({
          name: { $regex: new RegExp(`^${name}$`, "i") },
          _id: { $ne: new ObjectId(fieldId) },
        });

      if (existingField) {
        return {
          success: false,
          error: "A field with this name already exists",
        };
      }
    }

    // Calculate the difference in total area
    const areaDifference = totalArea - currentField.totalArea;

    // Calculate new remaining area
    const newRemainingArea = currentField.remainingArea + areaDifference;

    // Check if new remaining area would be negative
    if (newRemainingArea < 0) {
      return {
        success: false,
        error: "Cannot reduce total area below allocated area",
      };
    }

    // Update the field
    await db.collection("fields").updateOne(
      { _id: new ObjectId(fieldId) },
      {
        $set: {
          name,
          totalArea,
          remainingArea: newRemainingArea,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/fields");
    revalidatePath(`/fields/${fieldId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update field:", error);
    return {
      success: false,
      error: "Failed to update field",
    };
  }
}

export async function getFieldSummaryForList(fieldId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get all farmers for this field
    const fieldFarmers = await db
      .collection("field_farmers")
      .find({ fieldId: new ObjectId(fieldId) })
      .toArray();

    // Get all expenses for this field
    const expenses = await db
      .collection("field_expenses")
      .find({ fieldId: new ObjectId(fieldId) })
      .toArray();

    // Calculate totals
    let totalExpenses = 0;
    let totalIncome = 0;

    expenses.forEach((expense) => {
      if (expense.type === "expense") {
        totalExpenses += expense.amount;
      } else if (expense.type === "income") {
        totalIncome += expense.amount;
      }
    });

    return {
      success: true,
      farmerCount: fieldFarmers.length,
      totalExpenses: Math.round(totalExpenses),
      totalIncome: Math.round(totalIncome),
      balance: Math.round(totalIncome - totalExpenses),
    };
  } catch (error) {
    console.error("Failed to fetch field summary for list:", error);
    return {
      success: false,
      farmerCount: 0,
      totalExpenses: 0,
      totalIncome: 0,
      balance: 0,
    };
  }
}
