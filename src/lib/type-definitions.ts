export interface Tractor {
  _id: string;
  name: string;
  model: string;
  createdAt: Date;
  works: string[];
}

export interface TractorWork {
  no: number;
  id: string;
  customerId: string;
  tractorId: string;
  customerName: string;
  detail: string | undefined;
  date: string;
  driverName: string;
  equipments: {
    name: string;
    hours: number;
    ratePerHour: number;
    amount: number;
  }[];
  totalAmount: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    totalDebit: number;
    totalPaid: number;
    createdAt: string;
  };
}

export interface CategoryHours {
  equipment: "Gobal" | "Laser" | "Cultivator" | "Raja";
  hours: number;
}

export interface CustomerTractorWork {
  id: string;
  tractor: { name: string; model: string };
  categoryHours: CategoryHours[];
  amount: number;
  date: string;
}

// types/milk-summary

export interface MilkExpense {
  _id: string;
  typeId: string;
  amount: number;
  date: string;
  type: {
    _id: string;
    name: string;
  };
}

export interface WorkerCredit {
  _id: string;
  workerId: string;
  amount: number;
  date: string;
  description: string;
  worker: {
    _id: string;
    name: string;
  };
}

export interface CustomerRecord {
  _id: string;
  customerId: string;
  date: string;
  quantity: number;
  price: number;
  amount: number;
  customerName: string;
}

export interface Transaction {
  date: Date;
  type: "expense" | "income";
  description: string;
  amount: number;
  details: string;
  balance?: number;
}

export interface CustomerDebit {
  _id: string;
  customerId: string;
  date: string;
  amount: number;
  description: string;
  customerName: string;
}

export interface MilkSummaryData {
  expenses: MilkExpense[];
  // workerCredits: WorkerCredit[];
  customerDebits: CustomerDebit[];
  customerRecords: CustomerRecord[];
  years: number[];
  months: {
    year: number;
    month: number;
    label: string;
  }[];
  selectedYear?: string;
  selectedMonth?: string;
  startDate?: string;
  endDate?: string;
}

export interface SummaryCardProps {
  cards: {
    label: string;
    value: number;
    type: "income" | "expense" | "balance";
  }[];
}

// Base interface for MongoDB filter operations
export interface MongoDBFilter {
  date?: DateFilter;
}

// Interface for MongoDB date comparison operators
export interface DateFilter {
  $gte?: Date;
  $gt?: Date;
  $lt?: Date;
  $lte?: Date;
  $eq?: Date;
  $ne?: Date;
}

export interface BackupResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}

export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupError";
  }
}
