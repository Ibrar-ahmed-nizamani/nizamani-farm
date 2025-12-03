import { ObjectId } from "mongodb";

// --- For the Main "Fields" List Page ---
export interface FieldListItem {
  _id: string;
  name: string;
  totalArea: number;
  activeCrops: {
    _id: string;
    name: string;
    year: number;
  }[];
}

// --- For the "Crop Detail" Page (formerly Field Detail) ---

// Represents the summary cards at the top of the page
// Calculated on-demand from transactions
export interface CropSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  // Expense Split
  totalOwnerExpenses: number;
  totalFarmerExpenses: number;
  // Income Split
  totalOwnerIncome: number;
  totalFarmerIncome: number;
  // Net Balance Split
  totalOwnerBalance: number;
  totalFarmerBalance: number;
}

// Represents one row in the list of farmers on the crop detail page
export interface FarmerAllocationDetails {
  id: string; // Farmer ID
  _id: string; // For compatibility
  name: string;
  imageUrl?: string;
  allocatedArea: number;
  sharePercentage: number;
  
  // Aggregated stats for this specific crop (Calculated on-demand)
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

// --- For the "Farmer-Crop Detail" Page ---

// Represents one row in the list of transactions
export interface FarmerCropTransaction {
  _id: string;
  date: string; // Formatted for display
  type: "income" | "expense";
  category: string;
  item: string; // Mandatory now
  description: string;
  
  totalAmount: number;
  
  // Display columns
  farmerAmount: number;
  ownerAmount: number;
}

// Represents the entire data payload for the Crop page
export interface CropPageData {
  _id: string; // Crop ID
  fieldId: string;
  fieldName: string;
  name: string; // Crop Name
  year: number;
  
  summary: CropSummary;
  farmers: FarmerAllocationDetails[];
}

// --- Stock UI Types ---

export interface StockCategoryListItem {
  _id: string;
  name: string;
  itemCount: number;
}

export interface StockItemDetail {
  _id: string;
  name: string;
  currentQuantity: number;
  unit: string;
  averageCost: number;
  totalValue: number;
}
