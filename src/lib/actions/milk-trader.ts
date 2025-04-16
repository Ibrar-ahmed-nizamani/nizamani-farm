// lib/actions/milk-trader.ts
"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Modified getMilkTraders function in lib/actions/milk-trader.ts
export async function getMilkTraders() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const traders = await db
      .collection("milk_traders")
      .find({})
      .sort({ name: 1 })
      .toArray();

    // Calculate credit, debit, and balance for each trader
    let grandTotalCredit = 0;
    let grandTotalDebit = 0;

    const tradersWithBalance = await Promise.all(
      traders.map(async (trader) => {
        const traderId = trader._id;

        // Get all transactions for this trader
        const transactions = await db
          .collection("milk_trader_transactions")
          .find({ traderId })
          .toArray();

        // Calculate total credit and debit
        let totalCredit = 0;
        let totalDebit = 0;

        transactions.forEach((transaction) => {
          if (transaction.type === "credit") {
            totalCredit += transaction.amount;
          } else if (transaction.type === "debit") {
            totalDebit += transaction.amount;
          }
        });

        // Add to grand totals
        grandTotalCredit += totalCredit;
        grandTotalDebit += totalDebit;

        // Calculate balance
        const balance = totalCredit - totalDebit;

        return {
          name: trader.name,
          _id: trader._id.toString(),
          totalCredit,
          totalDebit,
          balance,
          balanceType: balance >= 0 ? "credit" : "debit",
        };
      })
    );

    // Calculate grand balance
    const grandBalance = grandTotalCredit - grandTotalDebit;

    return {
      traders: tradersWithBalance,
      summary: {
        totalCredit: grandTotalCredit,
        totalDebit: grandTotalDebit,
        balance: grandBalance,
      },
    };
  } catch (error) {
    console.error("Failed to fetch milk traders:", error);
    return {
      traders: [],
      summary: {
        totalCredit: 0,
        totalDebit: 0,
        balance: 0,
      },
    };
  }
}
export async function getMilkTrader(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const trader = await db
      .collection("milk_traders")
      .findOne({ _id: new ObjectId(id) });

    if (!trader) {
      throw new Error("Trader not found");
    }

    return {
      name: trader.name,
      _id: trader._id.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch milk trader:", error);
    throw new Error("Failed to fetch milk trader");
  }
}

export async function addMilkTrader(name: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Check if trader with same name exists
    const existingTrader = await db
      .collection("milk_traders")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingTrader) {
      return {
        success: false,
        error: "A trader with this name already exists",
      };
    }

    await db.collection("milk_traders").insertOne({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/milk/traders");
    return { success: true };
  } catch (error) {
    console.error("Failed to add milk trader:", error);
    return {
      success: false,
      error: "Failed to add trader",
    };
  }
}

export async function getMilkTraderTransactions(
  traderId: string,
  year?: string,
  month?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    interface DateFilter {
      traderId: ObjectId;
      date?: {
        $gte: Date;
        $lt: Date;
      };
    }

    const dateFilter: DateFilter = {
      traderId: new ObjectId(traderId),
    };

    if (year) {
      const startDate = month
        ? new Date(`${year}-${month}-01`)
        : new Date(`${year}-01-01`);

      const endDate = month
        ? new Date(new Date(startDate).setMonth(startDate.getMonth() + 1))
        : new Date(`${year}-12-31`);

      dateFilter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const transactions = await db
      .collection("milk_trader_transactions")
      .find(dateFilter)
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      _id: transaction._id.toString(),
      traderId: transaction.traderId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch milk trader transactions:", error);
    return [];
  }
}

export async function getMilkTraderDates(traderId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    interface DateFilter {
      traderId: ObjectId;
      date?: {
        $gte: Date;
        $lt: Date;
      };
    }

    const dateFilter: DateFilter = {
      traderId: new ObjectId(traderId),
    };

    const transactions = await db
      .collection("milk_trader_transactions")
      .find(dateFilter)
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      date: transaction.date,
      _id: transaction._id.toString(),
      traderId: transaction.traderId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch milk trader dates:", error);
    return [];
  }
}

// lib/actions/milk-trader.ts (continued)
export async function addMilkTraderTransaction(
  traderId: string,
  type: "debit" | "credit",
  amount: number,
  date: Date,
  description: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Verify trader exists
    const trader = await db
      .collection("milk_traders")
      .findOne({ _id: new ObjectId(traderId) });

    if (!trader) {
      return {
        success: false,
        error: "Trader not found",
      };
    }

    await db.collection("milk_trader_transactions").insertOne({
      traderId: new ObjectId(traderId),
      type,
      amount,
      date: new Date(date),
      description,
      createdAt: new Date(),
    });

    revalidatePath(`/milk/traders/${traderId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add trader transaction:", error);
    return {
      success: false,
      error: "Failed to add transaction",
    };
  }
}

export async function deleteMilkTraderTransaction(
  traderId: string,
  transactionId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // First, verify the transaction exists and belongs to the trader
    const transaction = await db
      .collection("milk_trader_transactions")
      .findOne({
        _id: new ObjectId(transactionId),
        traderId: new ObjectId(traderId),
      });

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Delete the transaction
    await db.collection("milk_trader_transactions").deleteOne({
      _id: new ObjectId(transactionId),
    });

    revalidatePath(`/milk/traders/${traderId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete trader transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

export async function updateMilkTraderTransaction(
  traderId: string,
  transactionId: string,
  type: "debit" | "credit",
  amount: number,
  date: Date,
  description: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // First, verify the transaction exists and belongs to the worker
    const transaction = await db
      .collection("milk_trader_transactions")
      .findOne({
        _id: new ObjectId(transactionId),
        traderId: new ObjectId(traderId),
      });

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Update the transaction
    await db.collection("milk_trader_transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          type,
          amount,
          date: new Date(date),
          description,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath(`/milk/traders/${traderId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update trader transaction:", error);
    return {
      success: false,
      error: "Failed to update transaction",
    };
  }
}
