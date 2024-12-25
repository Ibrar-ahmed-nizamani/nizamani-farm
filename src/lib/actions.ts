"use server";

import { revalidatePath } from "next/cache";

export async function submitTractorWork(
  prevState: unknown,
  formData: FormData
) {
  const fields = {
    customerName: formData.get("customerName"),
    dieselExpense: Number(formData.get("dieselExpense")),
    date: formData.get("date"),
    driverName: formData.get("driverName"),
    equipmentData: [
      {
        cultivator: {
          ratePerHour: Number(formData.get("cultivatorRatePerHour")),
          hoursWorked: Number(formData.get("cultivatorHours")),
        },
        gobal: {
          ratePerHour: Number(formData.get("gobalRatePerHour")),
          hoursWorked: Number(formData.get("gobalHours")),
        },
        laser: {
          ratePerHour: Number(formData.get("laserRatePerHour")),
          hoursWorked: Number(formData.get("laserHours")),
        },
        raja: {
          ratePerHour: Number(formData.get("rajaRatePerHour")),
          hoursWorked: Number(formData.get("rajaHours")),
        },
        blade: {
          ratePerHour: Number(formData.get("bladeRatePerHour")),
          hoursWorked: Number(formData.get("bladeHours")),
        },
      },
    ],
  };
  console.log(fields.date === "");
  // Check if fields are valid
  if (fields.date === "") {
    return { success: false, message: "Please Add date" };
  }

  // Log fields and return success
  console.log(fields.equipmentData);

  return {
    success: true,
    message: "Expense form submitted successfully!",
  };
}

type EquipmentRate = {
  name: string;
  rate: number;
};

// Dummy data for previous rates
const previousRates: EquipmentRate[] = [
  { name: "Cultivator", rate: 100 },
  { name: "Raja", rate: 150 },
  { name: "Laser", rate: 200 },
  { name: "Gobal", rate: 180 },
  { name: "Blade", rate: 120 },
];

export async function updateEquipmentRates(formData: FormData) {
  // In a real application, you would update these rates in your database
  const updatedRates = previousRates.map((equipment) => {
    const newRate = formData.get(equipment.name);
    return {
      name: equipment.name,
      rate: newRate ? parseFloat(newRate as string) : equipment.rate,
    };
  });

  console.log("Updated rates:", updatedRates);

  // Revalidate the page to reflect the changes
  revalidatePath("/");

  return { success: true, message: "Equipment rates updated successfully" };
}
