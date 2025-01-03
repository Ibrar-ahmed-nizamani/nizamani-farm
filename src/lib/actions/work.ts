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

export async function getCustomerWorks(customerId: string, year?: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const query: any = { customerId: new ObjectId(customerId) };
    if (year && year !== "all") {
      query.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const works = await db
      .collection("works")
      .aggregate([
        { $match: query },
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

    // Serialize the works data
    return works.map((work) => ({
      _id: work._id.toString(),
      customerId: work.customerId.toString(),
      tractorId: work.tractorId.toString(),
      customerName: work.customerName,
      date: work.date.toISOString(),
      driverName: work.driverName,
      equipments: work.equipments.map((eq: any) => ({
        name: eq.name,
        hours: eq.hours,
        ratePerHour: eq.ratePerHour,
        amount: eq.amount,
      })),
      totalAmount: work.totalAmount,
      createdAt: work.createdAt?.toISOString(),
      updatedAt: work.updatedAt?.toISOString(),
      tractor: {
        _id: work.tractor._id.toString(),
        tractorName: work.tractor.tractorName,
        tractorModel: work.tractor.tractorModel,
        tractorNumber: work.tractor.tractorNumber,
      },
    }));
  } catch (error) {
    console.error("Failed to fetch works:", error);
    throw new Error("Failed to fetch works");
  }
}

interface MatchCondition {
  tractorId: ObjectId;
  date?: {
    $gte: Date;
    $lte: Date;
  };
}

export async function getTractorWorks(
  tractorId: string,
  year?: string,
  page: number = 1
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");
    const limit = 20; // Hardcoded limit

    // Get available years
    const availableYears = await db.collection("works").distinct("date", {
      tractorId: new ObjectId(tractorId),
    });

    const years = [
      ...new Set(availableYears.map((date) => new Date(date).getFullYear())),
    ].sort((a, b) => b - a);

    // Build match condition

    const matchCondition: MatchCondition = {
      tractorId: new ObjectId(tractorId),
    };
    if (year && year !== "all") {
      matchCondition.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    // Get total count for pagination
    const totalCount = await db
      .collection("works")
      .countDocuments(matchCondition);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated works
    const works = await db
      .collection("works")
      .aggregate([
        { $match: matchCondition },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
        { $sort: { date: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .toArray();

    return {
      works: works.map((work, index) => ({
        no: totalCount - ((page - 1) * limit + index),
        id: work._id.toString(),
        customerId: work.customerId.toString(),
        tractorId: work.tractorId.toString(),
        customerName: work.customerName,
        date: work.date.toISOString(),
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
      })),
      pagination: {
        total: totalCount,
        pages: totalPages,
        currentPage: page,
      },
      availableYears: years,
    };
  } catch (error) {
    console.error("Failed to fetch tractor works:", error);
    return {
      works: [],
      pagination: { total: 0, pages: 0, currentPage: 1 },
      availableYears: [],
    };
  }
}

export async function getFilteredWorks(
  tractorId: string,
  year?: string,
  page: number = 1
) {
  const yearNum = year ? parseInt(year) : undefined;
  return getTractorWorks(tractorId, yearNum?.toString() || undefined, page);
}

export async function deleteWork(workId: string, tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // First get the work to get customer details
    const work = await db
      .collection("works")
      .findOne({ _id: new ObjectId(workId) });

    if (!work) {
      return { success: false, message: "Work not found" };
    }

    // Delete the work
    await db.collection("works").deleteOne({ _id: new ObjectId(workId) });

    // Delete associated transaction
    await db
      .collection("transactions")
      .deleteOne({ workId: new ObjectId(workId) });

    // Update customer's totalDebit
    await db
      .collection("customers")
      .updateOne(
        { _id: work.customerId },
        { $inc: { totalDebit: -work.totalAmount } }
      );

    // Check if customer has any remaining works
    const remainingWorks = await db
      .collection("works")
      .countDocuments({ customerId: work.customerId });

    // Check if customer has any remaining transactions
    const remainingTransactions = await db
      .collection("transactions")
      .countDocuments({
        customerId: work.customerId,
        workId: { $exists: false }, // Only count non-work transactions
      });

    // If no remaining works and no manual transactions, delete the customer
    if (remainingWorks === 0 && remainingTransactions === 0) {
      await db.collection("customers").deleteOne({ _id: work.customerId });
    }

    revalidatePath("/accounting/tractor");
    revalidatePath(`/accounting/tractor/${work.customerId}`);
    revalidatePath(`/tractor/${tractorId}`);
    return { success: true, message: "Work deleted successfully" };
  } catch (error) {
    console.error("Failed to delete work:", error);
    return { success: false, message: "Failed to delete work" };
  }
}

export async function getWorkById(workId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const work = await db
      .collection("works")
      .findOne({ _id: new ObjectId(workId) });

    if (!work) {
      throw new Error("Work not found");
    }

    return {
      id: work._id.toString(),
      customerId: work.customerId.toString(),
      customerName: work.customerName,
      date: work.date,
      driverName: work.driverName,
      equipments: work.equipments,
      totalAmount: work.totalAmount,
    };
  } catch (error) {
    console.error("Failed to fetch work:", error);
    throw new Error("Failed to fetch work");
  }
}

export async function editTractorWork(
  workId: string,
  prevState: unknown,
  formData: FormData
) {
  const tractorId = formData.get("tractorId") as string;
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get the original work to compare changes
    const originalWork = await db
      .collection("works")
      .findOne({ _id: new ObjectId(workId) });

    if (!originalWork) {
      return { success: false, message: "Work not found" };
    }

    const customerName = (formData.get("customerName") as string)
      .toLowerCase()
      .trim();
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

    // Handle customer debit updates
    if (originalWork.customerId.toString() !== customer._id.toString()) {
      // If customer changed, subtract amount from old customer and add to new customer
      await db
        .collection("customers")
        .updateOne(
          { _id: originalWork.customerId },
          { $inc: { totalDebit: -originalWork.totalAmount } }
        );
      await db
        .collection("customers")
        .updateOne(
          { _id: customer._id },
          { $inc: { totalDebit: totalAmount } }
        );
    } else {
      // Same customer, just update the difference
      const debitDifference = totalAmount - originalWork.totalAmount;
      if (debitDifference !== 0) {
        await db
          .collection("customers")
          .updateOne(
            { _id: customer._id },
            { $inc: { totalDebit: debitDifference } }
          );
      }
    }

    // Update work record
    await db.collection("works").updateOne(
      { _id: new ObjectId(workId) },
      {
        $set: {
          customerId: customer._id,
          customerName,
          date,
          driverName,
          equipments,
          totalAmount,
          updatedAt: new Date(),
        },
      }
    );

    // Update transaction
    await db.collection("transactions").updateOne(
      { workId: new ObjectId(workId) },
      {
        $set: {
          customerId: customer._id,
          amount: totalAmount,
          date,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/accounting/tractor");
    revalidatePath(`/accounting/tractor/${customer._id}`);
    revalidatePath(`/tractor/${tractorId}`);
    return { success: true, message: "Work updated successfully" };
  } catch (error) {
    console.error("Failed to update work:", error);
    return { success: false, message: "Failed to update work" };
  }
}

export async function getAllTractorWorks(tractorId: string, year?: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const query: any = { tractorId: new ObjectId(tractorId) };

    if (year && year !== "all") {
      query.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const works = await db
      .collection("works")
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return works.map((work) => ({
      _id: work._id.toString(),
      tractorId: work.tractorId.toString(),
      customerId: work.customerId.toString(),
      customerName: work.customerName,
      date: work.date,
      equipments: work.equipments,
      totalAmount: work.totalAmount,
      driverName: work.driverName,
    }));
  } catch (error) {
    console.error("Failed to fetch all works:", error);
    return [];
  }
}
