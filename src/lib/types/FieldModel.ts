import { ObjectId } from "mongodb";

// --- Allocations (Embedded in 'crops' Collection) ---
export interface Allocation {
  farmerId: ObjectId; // Reference to a Farmer
  allocatedArea: number;
  sharePercentage: number; // e.g., 50
}

// --- Crops Collection (The main operational unit) ---
// A "Crop" represents a specific season/year cultivation on a Field
export interface Crop {
  _id: ObjectId;
  fieldId: ObjectId; // Reference to physical Field
  name: string; // e.g., "Rice", "Wheat"
  year: number; // e.g., 2025
  season?: string; // e.g., "Kharif", "Rabi"
  
  allocations: Allocation[];
  
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// --- Fields Collection (Physical Land) ---
export interface Field {
  _id: ObjectId;
  name: string; // e.g., "North Acre 1"
  totalArea: number; // Physical size in acres
  createdAt: Date;
  // We might keep a list of crop IDs for quick navigation if needed, 
  // but querying Crops by fieldId is usually better for scalability.
}

// --- Transactions Collection ---
export interface Transaction {
  _id: ObjectId;
  cropId: ObjectId; // Reference to Crop (which links to Field)
  farmerId: ObjectId; // Reference to Farmer
  
  date: Date;
  type: "income" | "expense";
  category: string; // e.g., "Fertilizer", "Labor", "Sales"
  item: string; // e.g., "Urea" (Mandatory now)
  
  amount: number; // Total amount of the transaction
  description: string;
  
  // Split Logic
  splitDetails: {
    farmerSharePercentage: number; // e.g., 50
    // ownerSharePercentage is derived (100 - farmerSharePercentage)
    
    farmerAmount: number; // Calculated amount for farmer
    ownerAmount: number; // Calculated amount for owner
  };
  
  // Link to Stock if this was an auto-generated transaction
  stockDistributionId?: ObjectId;
  
  createdAt: Date;
}
