import { ObjectId } from "mongodb";

// --- Stock Management ---

export interface StockCategory {
  _id: ObjectId;
  name: string; // e.g., "Fertilizers", "Pesticides", "Seeds"
  createdAt: Date;
}

export interface StockImport {
  _id: ObjectId;
  date: Date;
  quantity: number;
  costPerUnit: number;
  totalCost: number;
  supplier?: string;
  invoiceNumber?: string;
}

export interface StockDistribution {
  _id: ObjectId;
  date: Date;
  cropId: ObjectId; // Reference to a Crop
  farmerId: ObjectId; // Reference to a Farmer
  quantity: number;
  costPerUnit: number; // Usually average cost at time of distribution
  totalCost: number;
  transactionId: ObjectId; // Link to the financial transaction created automatically
}

export interface StockItem {
  _id: ObjectId;
  categoryId: ObjectId; // Reference to StockCategory
  name: string; // e.g., "Urea", "DAP"
  unit: string; // e.g., "kg", "bag", "liter"
  currentQuantity: number;
  averageCost: number; // Moving average cost for accounting
  imports: StockImport[];
  distributions: StockDistribution[];
  createdAt: Date;
  updatedAt: Date;
}
