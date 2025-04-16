"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

interface WorkQuery {
  customerId?: ObjectId;
  tractorId?: ObjectId;
  date?: {
    $gte: Date;
    $lte: Date;
  };
}

interface Equipment {
  name: string;
  hours: number;
  ratePerHour: number;
  amount: number;
}

interface DateFilterOptions {
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
}

// Function to build date filter based on provided filter options
function buildDateFilter(filterOptions: DateFilterOptions) {
  const { year, month, startDate, endDate } = filterOptions;

  // Date range filter takes precedence
  if (startDate || endDate) {
    const dateFilter: any = {};

    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }

    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    return dateFilter;
  }

  // Year and month filter
  if (year && year !== "all") {
    if (month && month !== "all") {
      // Specific year and month
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0);

      return {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    // Just year filter
    return {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };
  }

  // No date filter
  return undefined;
}

// Get available months with data for a tractor (from both works and expenses)
export async function getTractorAvailableMonths(tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Fetch dates from both works and expenses collections
    const [works, expenses] = await Promise.all([
      db
        .collection("works")
        .find({ tractorId: new ObjectId(tractorId) })
        .project({ date: 1 })
        .toArray(),
      db
        .collection("tractorExpenses")
        .find({ tractorId: new ObjectId(tractorId) })
        .project({ date: 1 })
        .toArray(),
    ]);

    const monthsMap = new Map();

    // Process work dates
    works.forEach((work) => {
      const date = new Date(work.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString("default", { month: "long" });

      const key = `${year}-${month}`;
      monthsMap.set(key, { year, month, label: monthName });
    });

    // Process expense dates
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString("default", { month: "long" });

      const key = `${year}-${month}`;
      monthsMap.set(key, { year, month, label: monthName });
    });

    // Convert the map to an array and sort by year (descending) and month (descending)
    return Array.from(monthsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.month - b.month;
    });
  } catch (error) {
    console.error("Failed to fetch tractor available months:", error);
    return [];
  }
}
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
    const dateStr = formData.get("date") as string;
    const detail = formData.get("detail") as string;
    const driverName = formData.get("driverName") as string;

    if (!dateStr) {
      return { success: false, message: "Date is required" };
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { success: false, message: "Invalid date format" };
    }

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

    // Get all form entries
    const entries = Array.from(formData.entries());

    // Extract equipment entries
    const equipments = entries
      .filter(
        ([key]) =>
          key.endsWith("Hours") && parseFloat(formData.get(key) as string) > 0
      )
      .map(([key]) => {
        const name = key.replace("Hours", "");
        const hours = parseFloat(formData.get(`${name}Hours`) as string) || 0;
        const ratePerHour = parseFloat(
          formData.get(`${name}RatePerHour`) as string
        );
        const amount = parseFloat(formData.get(`${name}Amount`) as string) || 0;

        return {
          name: name.toLowerCase(),
          hours,
          ratePerHour,
          amount,
        };
      });
    if (equipments.length === 0) {
      return {
        success: false,
        message: "At least one equipment must be added",
      };
    }

    const totalAmount = equipments.reduce((sum, eq) => sum + eq.amount, 0);

    // Create work record
    const workResult = await db.collection("works").insertOne({
      customerId: customer._id,
      tractorId: new ObjectId(tractorId),
      customerName,
      date,
      detail,
      driverName,
      equipments,
      totalAmount,
      createdAt: new Date(),
    });

    // Create transaction record
    await db.collection("transactions").insertOne({
      customerId: customer._id,
      workId: workResult.insertedId,
      amount: totalAmount,
      type: "DEBIT",
      date,
      createdAt: new Date(),
    });

    // Update customer's total debit
    await db
      .collection("customers")
      .updateOne({ _id: customer._id }, { $inc: { totalDebit: totalAmount } });

    revalidatePath("/accounting/tractor");
    revalidatePath(`/accounting/tractor/${customer._id}`);
    revalidatePath(`/tractor/${tractorId}`);
    return { success: true, message: "Work submitted successfully" };
  } catch (error) {
    console.error("Failed to submit work:", error);
    return { success: false, message: "Failed to submit work" };
  }
}

export async function getCustomerWorks(
  customerId: string,
  year?: string,
  month?: string,
  startDate?: string,
  endDate?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const query: WorkQuery = { customerId: new ObjectId(customerId) };

    if (startDate && endDate) {
      // Use date range filtering if provided
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (year && year !== "all") {
      if (month && month !== "all") {
        // Both year and month filtering
        const monthNum = parseInt(month);
        const lastDay = new Date(parseInt(year), monthNum, 0).getDate();
        query.date = {
          $gte: new Date(`${year}-${monthNum.toString().padStart(2, "0")}-01`),
          $lte: new Date(
            `${year}-${monthNum.toString().padStart(2, "0")}-${lastDay}`
          ),
        };
      } else {
        // Only year filtering
        query.date = {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        };
      }
    }

    // Rest of the function remains the same...

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
      detail: work.detail ? work.detail : "N/A",
      driverName: work.driverName,
      equipments: work.equipments.map((eq: Equipment) => ({
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

export async function getTractorWorks(
  tractorId: string,
  filterOptions: DateFilterOptions = {}
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get available years
    const availableYears = await db.collection("works").distinct("date", {
      tractorId: new ObjectId(tractorId),
    });

    const years = [
      ...new Set(availableYears.map((date) => new Date(date).getFullYear())),
    ].sort((a, b) => b - a);

    // Build match condition
    const matchCondition: WorkQuery = {
      tractorId: new ObjectId(tractorId),
    };

    const dateFilter = buildDateFilter(filterOptions);
    if (dateFilter) {
      matchCondition.date = dateFilter;
    }

    // Get total count for pagination
    const totalCount = await db
      .collection("works")
      .countDocuments(matchCondition);

    // Get works (no pagination)
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
      ])
      .toArray();

    return {
      works: works.map((work, index) => ({
        no: totalCount - index,
        id: work._id.toString(),
        customerId: work.customerId.toString(),
        tractorId: work.tractorId.toString(),
        customerName: work.customerName,
        date: work.date.toISOString(),
        detail: work.detail,
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
      availableYears: years,
    };
  } catch (error) {
    console.error("Failed to fetch tractor works:", error);
    return {
      works: [],
      availableYears: [],
    };
  }
}

export async function getFilteredWorks(
  tractorId: string,
  filterOptions: DateFilterOptions = {}
) {
  return getTractorWorks(tractorId, filterOptions);
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
      detail: work.detail ? work.detail : "N/A",
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
    const detail = formData.get("detail") as string;
    const driverName = formData.get("driverName") as string;

    if (!dateStr) {
      return { success: false, message: "Date is required" };
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { success: false, message: "Invalid date format" };
    }

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

    // Get all form entries and extract equipment data
    const entries = Array.from(formData.entries());
    const equipments = entries
      .filter(
        ([key]) =>
          key.endsWith("Hours") && parseFloat(formData.get(key) as string) > 0
      )
      .map(([key]) => {
        const name = key.replace("Hours", "");
        const hours = parseFloat(formData.get(`${name}Hours`) as string) || 0;
        const ratePerHour = parseFloat(
          formData.get(`${name}RatePerHour`) as string
        );
        const amount = parseFloat(formData.get(`${name}Amount`) as string) || 0;

        return {
          name: name.toLowerCase(),
          hours,
          ratePerHour,
          amount,
        };
      });

    if (equipments.length === 0) {
      return {
        success: false,
        message: "At least one equipment must be added",
      };
    }

    const totalAmount = equipments.reduce((sum, eq) => sum + eq.amount, 0);

    // Handle customer debit updates
    if (originalWork.customerId.toString() !== customer._id.toString()) {
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
          detail,
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

export async function getAllTractorWorks(
  tractorId: string,
  filterOptions: DateFilterOptions = {}
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const query: { tractorId: ObjectId; date?: any } = {
      tractorId: new ObjectId(tractorId),
    };

    const dateFilter = buildDateFilter(filterOptions);
    if (dateFilter) {
      query.date = dateFilter;
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
      detail: work.detail ? work.detail : "N/A",
      equipments: work.equipments,
      totalAmount: work.totalAmount,
      driverName: work.driverName,
    }));
  } catch (error) {
    console.error("Failed to fetch all works:", error);
    return [];
  }
}
