// --- For the Main "Fields" List Page ---
export interface FieldListItem {
  _id: string;
  name: string;
  totalArea: number;
  farmerCount: number;
  remainingArea: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

// --- For the "Field Detail" Page ---

// Represents the summary cards at the top of the page
export interface FieldSummary {
  totalIncome: number;
  totalExpense: number; // Match component expectation
  balance: number;
  // Expense Split
  totalOwnerExpenses: number; // Match component expectation
  totalFarmerExpenses: number; // Match component expectation
  // Income Split
  totalOwnerIncome: number; // Match component expectation
  totalFarmerIncome: number; // Match component expectation
  // Net Balance Split
  totalOwnerBalance: number; // Match component expectation
  totalFarmerBalance: number; // Match component expectation
}

// Represents one row in the list of farmers on the field detail page
export interface FarmerAllocationDetails {
  id: string;
  _id: string; // For CustomSearch component compatibility
  name: string;
  allocatedArea: number;
  share: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

// --- For the "Farmer-Field Detail" Page ---

// Represents one row in the list of transactions on the page
export interface FarmerFieldTransaction {
  _id: string;
  date: string; // Formatted for display
  type: string;
  description: string;
  totalIncome: number | null;
  farmerIncome: number | null;
  ownerIncome: number | null;
  totalExpense: number | null;
  farmerExpense: number | null;
  ownerExpense: number | null;
}

// This could also reuse the FieldSummary type if the cards are identical
export interface FarmerFieldSummary {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  // ... and the split details
  ownerExpense: number;
  farmerExpense: number;
  ownerIncome: number;
  farmerIncome: number;
  ownerNetBalance: number;
  farmerNetBalance: number;
}

// Represents the entire data payload for the page
export interface FieldPageData {
  _id: string;
  name: string;
  totalArea: number;
  summary: FieldSummary;
  farmers: FarmerAllocationDetails[];
  // You might still fetch years/months separately if the aggregation gets too slow
  // availableYears?: number[];
}

export interface DateFilterOptions {
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
}
