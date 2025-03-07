"use server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

export async function getCustomerSummary(
  customerId: string,
  year?: string,
  month?: string,
  startDate?: string,
  endDate?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    let dateMatch = {};
    if (startDate && endDate) {
      // Date range filtering takes precedence
      dateMatch = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (year && year !== "all") {
      if (month && month !== "all") {
        // Both year and month filtering
        const monthNum = parseInt(month);
        const lastDay = new Date(parseInt(year), monthNum, 0).getDate(); // Get last day of the month
        const startDate = new Date(
          `${year}-${monthNum.toString().padStart(2, "0")}-01`
        );
        const endDate = new Date(
          `${year}-${monthNum.toString().padStart(2, "0")}-${lastDay}`
        );

        dateMatch = {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        };
      } else {
        // Only year filtering
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        dateMatch = {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        };
      }
    }

    const customer = await db
      .collection("customers")
      .findOne({ _id: new ObjectId(customerId) });

    const works = await db
      .collection("works")
      .aggregate([
        {
          $match: {
            customerId: new ObjectId(customerId),
            ...dateMatch,
          },
        },
        {
          $lookup: {
            from: "tractors",
            localField: "tractorId",
            foreignField: "_id",
            as: "tractor",
          },
        },
        {
          $set: {
            tractor: {
              $cond: {
                if: { $eq: [{ $size: "$tractor" }, 0] },
                then: null,
                else: { $arrayElemAt: ["$tractor", 0] },
              },
            },
          },
        },
        { $sort: { date: -1 } },
      ])
      .toArray();

    const transactions = await db
      .collection("transactions")
      .find({
        customerId: new ObjectId(customerId),
        ...dateMatch,
      })
      .sort({ date: -1 })
      .toArray();
    const totalDebit = transactions.reduce(
      (sum, transaction) =>
        sum + (transaction.type === "DEBIT" ? transaction.amount : 0),
      0
    );
    const totalPaid = transactions.reduce(
      (sum, transaction) =>
        sum + (transaction.type === "CREDIT" ? transaction.amount : 0),
      0
    );
    const balance = totalDebit - totalPaid;

    return {
      customer,
      works,
      transactions,
      summary: {
        totalDebit,
        totalPaid,
        balance,
      },
    };
  } catch (error) {
    console.error("Failed to fetch customer summary:", error);
    throw new Error("Failed to fetch customer summary");
  }
}

export async function getCustomerAvailableYears(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get unique years from both works and transactions
    const [workYears, transactionYears] = await Promise.all([
      db
        .collection("works")
        .distinct("date", { customerId: new ObjectId(customerId) }),
      db
        .collection("transactions")
        .distinct("date", { customerId: new ObjectId(customerId) }),
    ]);

    // Combine years from both collections and get unique years
    const allDates = [...workYears, ...transactionYears];
    const uniqueYears = Array.from(
      new Set(allDates.map((date) => new Date(date).getFullYear()))
    ).sort((a, b) => b - a); // Sort years in descending order

    return uniqueYears;
  } catch (error) {
    console.error("Failed to fetch customer years:", error);
    return [];
  }
}

export async function getCustomerAvailableMonths(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Get all dates from works and transactions
    const [workDates, transactionDates] = await Promise.all([
      db
        .collection("works")
        .find(
          { customerId: new ObjectId(customerId) },
          { projection: { date: 1 } }
        )
        .toArray(),
      db
        .collection("transactions")
        .find(
          { customerId: new ObjectId(customerId) },
          { projection: { date: 1 } }
        )
        .toArray(),
    ]);

    // Combine dates from both collections
    const allDates = [
      ...workDates.map((work) => new Date(work.date)),
      ...transactionDates.map((transaction) => new Date(transaction.date)),
    ];

    // Create a map of year-month combinations
    const monthMap = new Map();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    allDates.forEach((date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          year,
          month: month + 1, // Convert to 1-based month
          label: monthNames[month],
        });
      }
    });

    // Convert the map to an array and sort by year and month
    const availableMonths = Array.from(monthMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.month - b.month;
    });

    return availableMonths;
  } catch (error) {
    console.error("Failed to fetch customer months:", error);
    return [];
  }
}

// The rest of the functions remain the same
export async function getAllCustomers() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const customers = await db
      .collection("customers")
      .find({})
      .sort({ name: 1 })
      .toArray();

    // Serialize the MongoDB documents
    return customers.map((customer) => ({
      _id: customer._id.toString(),
      name: customer.name,
      totalDebit: customer.totalDebit,
      totalPaid: customer.totalPaid,
      createdAt: customer.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function addTractorCustomer(name: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Check if trader with same name exists
    const existingCustomer = await db
      .collection("customers")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingCustomer) {
      return {
        success: false,
        error: "A customer with this name already exists",
      };
    }

    await db.collection("customers").insertOne({
      name,
      totalDebit: 0,
      totalPaid: 0,
      createdAt: new Date(),
    });

    revalidatePath("/accounting/tractor");
    return { success: true };
  } catch (error) {
    console.error("Failed to add tractor Customer:", error);
    return {
      success: false,
      error: "Failed to add tractor Customer",
    };
  }
}

export async function getCustomerName(customerId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const customer = await db
      .collection("customers")
      .findOne({ _id: new ObjectId(customerId) });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return {
      ...customer,
    };
  } catch (error) {
    console.error("Failed to fetch customer detail:", error);
    throw new Error("Failed to fetch customer detail");
  }
}
