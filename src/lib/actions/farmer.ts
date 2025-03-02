// lib/actions/farmer.ts
"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
        createdAt: new Date(),
      });
      farmer = {
        _id: result.insertedId,
        name: farmerName,
      };
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

export async function addFarmerTransaction(
  fieldId: string,
  farmerId: string,
  type: "DEBIT" | "CREDIT",
  amount: number,
  description: string,
  date: Date
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db.collection("farmer_transactions").insertOne({
      fieldId: new ObjectId(fieldId),
      farmerId: new ObjectId(farmerId),
      type,
      amount,
      description,
      date: new Date(date),
      createdAt: new Date(),
    });

    revalidatePath(`/fields/${fieldId}/farmers/${farmerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add farmer transaction:", error);
    return {
      success: false,
      error: "Failed to add transaction",
    };
  }
}
