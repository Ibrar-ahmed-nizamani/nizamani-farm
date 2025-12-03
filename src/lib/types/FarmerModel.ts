import { ObjectId } from "mongodb";

// --- Farmer Configuration ---

export interface ExpenseShareConfig {
  category: string; // e.g., "Fertilizer", "Pesticides", "Labor"
  farmerShare: number; // Percentage (0-100)
  ownerShare: number; // Percentage (0-100)
}

export interface FarmerConfig {
  _id: ObjectId;
  name: string; // e.g., "50% Share Partner", "Contractor"
  baseSharePercentage: number; // Default share for the farmer (e.g., 50)
  expenseConfigs: ExpenseShareConfig[]; // Specific overrides or defaults for expenses
  createdAt: Date;
}

// --- Farmer Profile ---

export interface Farmer {
  _id: ObjectId;
  name: string;
  cnic?: string; // ID Number
  phone?: string;
  imageUrl?: string;
  description?: string;
  
  workingFields: ObjectId[]; // IDs of Crops/Fields they are currently active in
  archivedFields: ObjectId[]; // IDs of past Crops/Fields
  
  configId?: ObjectId; // Link to a default configuration
  createdAt: Date;
  updatedAt: Date;
}
