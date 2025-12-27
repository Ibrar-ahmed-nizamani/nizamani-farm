"use server";

import { getDbV2 } from "@/lib/db/v2";
import { Farmer, FarmerConfig } from "@/lib/types/FarmerModel";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// --- Farmer Configuration Actions ---

export async function createFarmerConfig(data: Omit<FarmerConfig, "_id" | "createdAt" | "expenseConfigs"> & { expenseConfigs: { categoryId: string; category: string; itemName: string; farmerShare: number; ownerShare: number }[] }) {
  const db = await getDbV2();
  const result = await db.collection<FarmerConfig>("farmerConfigs").insertOne({
    ...data,
    _id: new ObjectId(),
    expenseConfigs: data.expenseConfigs.map(ec => ({
        ...ec,
        categoryId: new ObjectId(ec.categoryId)
    })),
    createdAt: new Date(),
  });
  revalidatePath("/farmers/configuration");
  return { success: true, id: result.insertedId.toString() };
}

export async function getFarmerConfigs() {
  const db = await getDbV2();
  const configs = await db.collection<FarmerConfig>("farmerConfigs")
    .find({}, { projection: { name: 1, baseSharePercentage: 1 } })
    .toArray();
  return configs.map(config => ({
    _id: config._id.toString(),
    name: config.name,
    baseSharePercentage: config.baseSharePercentage
  }));
}

export async function getFarmerConfig(id: string) {
  const db = await getDbV2();
  const config = await db.collection<FarmerConfig>("farmerConfigs").findOne({ _id: new ObjectId(id) });
  if (!config) return null;
  return {
    ...config,
    _id: config._id.toString(),
    expenseConfigs: config.expenseConfigs.map(ec => ({
      ...ec,
      categoryId: ec.categoryId.toString()
    }))
  };
}

export async function deleteFarmerConfig(id: string) {
  const db = await getDbV2();
  await db.collection("farmerConfigs").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/farmers/configuration");
}

// --- Farmer Actions ---

export async function createFarmer(data: Omit<Farmer, "_id" | "createdAt" | "updatedAt" | "workingFields" | "archivedFields">) {
  const db = await getDbV2();
  const result = await db.collection<Farmer>("farmers").insertOne({
    ...data,
    _id: new ObjectId(),
    // configId removed
    workingFields: [],
    archivedFields: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath("/farmers");
  return { success: true, id: result.insertedId.toString() };
}

export async function getFarmers() {
  const db = await getDbV2();
  const farmers = await db.collection<Farmer>("farmers")
    .find({}, { projection: { configId: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
    
  return farmers.map(farmer => ({
    ...farmer,
    _id: farmer._id.toString(),
    workingFields: (farmer.workingFields || []).map(id => id.toString()),
    archivedFields: (farmer.archivedFields || []).map(id => id.toString()),
    createdAt: new Date(farmer.createdAt).toISOString(),
    updatedAt: new Date(farmer.updatedAt).toISOString(),
  }));
}

export async function getFarmer(id: string) {
  const db = await getDbV2();
  const farmer = await db.collection<Farmer>("farmers").findOne({ _id: new ObjectId(id) });
  
  if (!farmer) return null;

  // On-Demand Aggregation
  // We need to fetch all transactions for this farmer to calculate the summary
  // Note: This assumes transactions are stored in a 'transactions' collection in farm-v2
  const transactions = await db.collection("transactions").find({ farmerId: new ObjectId(id) }).toArray();

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(tx => {
    // Calculate farmer's share based on the transaction split details
    // Assuming tx structure matches the new Transaction interface
    if (tx.type === "income") {
        totalIncome += tx.splitDetails.farmerAmount || 0;
    } else if (tx.type === "expense") {
        totalExpense += tx.splitDetails.farmerAmount || 0;
    }
  });

  const currentBalance = totalIncome - totalExpense;

  const { configId, ...rest } = farmer as any;

  return {
    ...rest,
    _id: farmer._id.toString(),
    workingFields: farmer.workingFields.map(id => id.toString()),
    archivedFields: farmer.archivedFields.map(id => id.toString()),
    summary: {
        totalIncome,
        totalExpense,
        currentBalance
    }
  };
}

export async function updateFarmer(id: string, data: Partial<Farmer>) {
    const db = await getDbV2();
    await db.collection("farmers").updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date() } }
    );
    revalidatePath(`/farmers/${id}`);
    revalidatePath("/farmers");
}

export async function addExpenseToConfig(configId: string, expenseConfig: { categoryId: string; category: string; itemName: string; farmerShare: number; ownerShare: number }) {
    const db = await getDbV2();
    await db.collection("farmerConfigs").updateOne(
        { _id: new ObjectId(configId) },
        { 
            $push: { 
                expenseConfigs: {
                    ...expenseConfig,
                    categoryId: new ObjectId(expenseConfig.categoryId)
                } 
            } as any 
        }
    );
    revalidatePath(`/farmers/configuration/${configId}`);
}

export async function removeExpenseFromConfig(configId: string, categoryId: string) {
    const db = await getDbV2();
    await db.collection("farmerConfigs").updateOne(
        { _id: new ObjectId(configId) },
        { 
            $pull: { 
                expenseConfigs: { categoryId: new ObjectId(categoryId) } 
            } as any 
        }
    );
    revalidatePath(`/farmers/configuration/${configId}`);
}
