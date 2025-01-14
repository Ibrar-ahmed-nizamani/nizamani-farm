"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";

const DEFAULT_EQUIPMENT = [
  { name: "Cultivator", rate: 1500 },
  { name: "Raja", rate: 1500 },
  { name: "Gobal", rate: 1500 },
  { name: "Laser", rate: 2000 },
  { name: "Blade", rate: 1500 },
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
