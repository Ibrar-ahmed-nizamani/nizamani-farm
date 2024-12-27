import { ObjectId } from "mongodb";

// These are TypeScript interfaces representing our MongoDB collections
export interface Customer {
  _id: ObjectId;
  name: string;
  totalDebit: number;
  totalPaid: number;
  createdAt: Date;
}

export interface Transaction {
  _id: ObjectId;
  customerId: ObjectId;
  amount: number;
  type: "DEBIT" | "CREDIT";
  date: Date;
  description: string;
  workId?: ObjectId; // Reference to work if transaction is from work
}

export interface Work {
  _id: ObjectId;
  customerId: ObjectId;
  tractorId: ObjectId;
  date: Date;
  customerName: string;
  // dieselExpense: number;
  driverName: string;
  equipments: {
    name: string;
    hours: number;
    ratePerHour: number;
    amount: number;
  }[];
  totalAmount: number;
  createdAt: Date;
}

export interface TractorExpense {
  _id: ObjectId;
  tractorId: ObjectId;
  amount: number;
  date: Date;
  description: string;
  createdAt: Date;
}
