"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";

const DEFAULT_EQUIPMENT = [
  { name: "cultivator", rate: 1500 },
  { name: "raja", rate: 1500 },
  { name: "gobal", rate: 1500 },
  { name: "laser", rate: 2000 },
  { name: "blade", rate: 1500 },
];

export async function initializeEquipmentRates() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");
    const collection = db.collection("equipment_rates");

    // Check if rates exist
    const existingRates = await collection.countDocuments();

    if (existingRates === 0) {
      // Insert default equipment rates
      await collection.insertMany(DEFAULT_EQUIPMENT);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to initialize equipment rates:", error);
    return { success: false };
  }
}

export async function getEquipmentRates() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Initialize rates if they don't exist
    await initializeEquipmentRates();

    const rates = await db.collection("equipment_rates").find({}).toArray();

    return rates.map((rate) => ({
      _id: rate._id.toString(),
      name: rate.name,
      rate: rate.rate,
    }));
  } catch (error) {
    console.error("Failed to fetch equipment rates:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function updateEquipmentRate(
  equipmentId: string,
  newRate: number
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    await db
      .collection("equipment_rates")
      .updateOne(
        { _id: new ObjectId(equipmentId) },
        { $set: { rate: newRate } }
      );

    revalidatePath("/tractor/equipment-rates");
    return { success: true };
  } catch (error) {
    console.error("Failed to update equipment rate:", error);
    return { success: false, error: "Failed to update equipment rate" };
  }
}

export async function addEquipment(name: string, rate: number) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Check if equipment with same name exists
    const existing = await db.collection("equipment_rates").findOne({ name });
    console.log(existing);
    if (existing) {
      return {
        success: false,
        error: "Equipment with this name already exists",
      };
    }

    // Insert new equipment
    await db.collection("equipment_rates").insertOne({
      name: name.toLowerCase(),
      rate,
    });

    revalidatePath("/tractor/equipment-rates");
    return { success: true };
  } catch (error) {
    console.error("Failed to add equipment:", error);
    return {
      success: false,
      error: "Failed to add equipment",
    };
  }
}
