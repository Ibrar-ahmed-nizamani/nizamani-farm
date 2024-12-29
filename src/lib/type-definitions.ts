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
