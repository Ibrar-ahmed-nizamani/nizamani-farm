import { ObjectId } from "mongodb";

export interface ExpenseCategory {
  _id: ObjectId;
  category: string; // e.g., "Fertilizer"
  name: string; // e.g., "DAP"
  createdAt: Date;
}
