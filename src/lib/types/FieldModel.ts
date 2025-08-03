import { ObjectId } from "mongodb";

// --- expenseShares Collection ---
export interface ExpenseShare {
  _id: ObjectId;
  name: string;
  percentage: number;
  farmerType: number; // 25, 50 , 100
  createdAt: Date;
}

// --- allocations (Embedded in 'fields' Collection) ---
export interface Allocation {
  farmerId: ObjectId; // Reference to a Farmer
  allocatedArea: number;
  share: number; // 25, 50 , 100
}

// --- fields Collection ---
export interface Field {
  _id: ObjectId;
  name: string;
  year: number;
  totalArea: number;
  createdAt: Date;
  allocations: Allocation[];
}

// --- farmers Collection ---
export interface Farmer {
  _id: ObjectId;
  name: string;
  createdAt: Date;
  workingFields: ObjectId[]; // Array of Field IDs
}

// --- transactions Collection ---
export interface Transaction {
  _id: ObjectId;
  fieldId: ObjectId; // Direct reference to Field
  farmerId: ObjectId; // Direct reference to Farmer
  type: "income" | "expense";
  amount: number;
  description: string;
  createdAt: Date;
  splitDetails: {
    expenseShareName?: string;
    expenseSharePercentage?: number;
    ownerPortion: number;
    farmerPortion: number;
  };
}
