"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

export async function submitTractorWork(
  prevState: unknown,
  formData: FormData
) {
  const tractorId = formData.get("tractorId") as string;
  try {
    const client = await clientPromise;
    const db = client.db("farm");
    const customerName = (formData.get("customerName") as string)
      .toLowerCase()
      .trim();
    // const dieselExpense = parseFloat(formData.get("dieselExpense") as string);
    const dateStr = formData.get("date") as string;
    if (!dateStr) {
      return { success: false, message: "Date is required" };
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { success: false, message: "Invalid date format" };
    }
    const driverName = formData.get("driverName") as string;

    // Get or create customer
    let customer = await db
      .collection("customers")
      .findOne({ name: customerName });
    if (!customer) {
      const customerResult = await db.collection("customers").insertOne({
        name: customerName,
        totalDebit: 0,
        totalPaid: 0,
        createdAt: new Date(),
      });
      customer = { _id: customerResult.insertedId };
    }

    // Calculate equipment amounts from form data
    const equipments = ["Cultivator", "Raja", "Gobal", "Laser", "Blade"]
      .map((name) => ({
        name,
        hours:
          parseFloat(formData.get(`${name.toLowerCase()}Hours`) as string) || 0,
        ratePerHour: parseFloat(
          formData.get(`${name.toLowerCase()}RatePerHour`) as string
        ),
        amount:
          parseFloat(formData.get(`${name.toLowerCase()}Amount`) as string) ||
          0,
      }))
      .filter((eq) => eq.hours > 0);

    if (equipments.length === 0) {
      return {
        success: false,
        message: "At least one equipment must be added",
      };
    }

    const totalAmount = equipments.reduce((sum, eq) => sum + eq.amount, 0);

    // Insert work record
    const workResult = await db.collection("works").insertOne({
      customerId: customer._id,
      tractorId: new ObjectId(tractorId),
      customerName,
      date,
      // dieselExpense,
      driverName,
      equipments,
      totalAmount,
      createdAt: new Date(),
    });

    // Create transaction for the work
    await db.collection("transactions").insertOne({
      customerId: customer._id,
      workId: workResult.insertedId,
      amount: totalAmount,
      type: "DEBIT",
      date,
      createdAt: new Date(),
    });

    // Update customer's totalDebit
    await db
      .collection("customers")
      .updateOne({ _id: customer._id }, { $inc: { totalDebit: totalAmount } });

    revalidatePath("/accounting/tractor");
    revalidatePath(`/accounting/tractor/${customer._id}`);
    return { success: true, message: "Work submitted successfully" };
  } catch (error) {
    console.error("Failed to submit work:", error);
    return { success: false, message: "Failed to submit work" };
  }
  // redirect(`/tractor/${tractorId}`);
}

export async function getCustomerWorks(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const works = await db
      .collection("works")
      .aggregate([
        { $match: { customerId: new ObjectId(customerId) } },
        {
          $lookup: {
            from: "tractors",
            localField: "tractorId",
            foreignField: "_id",
            as: "tractor",
          },
        },
        { $unwind: "$tractor" },
      ])
      .sort({ date: -1 })
      .toArray();

    return works;
  } catch (error) {
    console.error("Failed to fetch works:", error);
    throw new Error("Failed to fetch works");
  }
}

export async function getTractorWorks(tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const works = await db
      .collection("works")
      .aggregate([
        { $match: { tractorId: new ObjectId(tractorId) } },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
      ])
      .toArray();

    // Serialize the MongoDB documents
    return works.map((work) => ({
      id: work._id.toString(),
      customerId: work.customerId.toString(),
      tractorId: work.tractorId.toString(),
      customerName: work.customerName,
      date: work.date.toISOString(),
      dieselExpense: work.dieselExpense,
      driverName: work.driverName,
      equipments: work.equipments,
      totalAmount: work.totalAmount,
      createdAt: work.createdAt.toISOString(),
      customer: {
        id: work.customer._id.toString(),
        name: work.customer.name,
        totalDebit: work.customer.totalDebit,
        totalPaid: work.customer.totalPaid,
        createdAt: work.customer.createdAt.toISOString(),
      },
    }));
  } catch (error) {
    console.error("Failed to fetch tractor works:", error);
    return [];
  }
}
