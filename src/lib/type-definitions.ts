export interface Tractor {
  _id: string;
  name: string;
  model: string;
  createdAt: Date;
  works: string[];
}

export interface TractorWork {
  id: string;
  customer: string;
  categoryHours: CategoryHours[];
  totalAmount: number;
  date: string;
  diesel: number;
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
