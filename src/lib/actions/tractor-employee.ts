"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getTractorEmployees() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const employees = await db
      .collection("tractor_employees")
      .find({})
      .sort({ name: 1 })
      .toArray();

    return employees.map((employee) => ({
      name: employee.name,
      _id: employee._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch tractor employees:", error);
    return [];
  }
}

export async function getTractorEmployee(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const employee = await db
      .collection("tractor_employees")
      .findOne({ _id: new ObjectId(id) });

    if (!employee) {
      throw new Error("Tractor employee not found");
    }

    return {
      name: employee.name,
      _id: employee._id.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch tractor employee:", error);
    throw new Error("Failed to fetch tractor employee");
  }
}

export async function addTractorEmployee(name: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Check if employee with same name exists
    const existingEmployee = await db
      .collection("tractor_employees")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingEmployee) {
      return {
        success: false,
        error: "A tractor employee with this name already exists",
      };
    }

    await db.collection("tractor_employees").insertOne({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/tractor/employees");
    return { success: true };
  } catch (error) {
    console.error("Failed to add tractor employee:", error);
    return {
      success: false,
      error: "Failed to add employee",
    };
  }
}

export async function getTractorEmployeeTransactions(
  employeeId: string,
  year?: string,
  month?: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    interface DateFilter {
      employeeId: ObjectId;
      date?: {
        $gte: Date;
        $lt: Date;
      };
    }

    const dateFilter: DateFilter = {
      employeeId: new ObjectId(employeeId),
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
      .collection("tractor_employee_transactions")
      .find(dateFilter)
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      _id: transaction._id.toString(),
      employeeId: transaction.employeeId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch tractor employee transactions:", error);
    return [];
  }
}

export async function getTractorEmployeeDates(employeeId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    interface DateFilter {
      employeeId: ObjectId;
      date?: {
        $gte: Date;
        $lt: Date;
      };
    }

    const dateFilter: DateFilter = {
      employeeId: new ObjectId(employeeId),
    };

    const transactions = await db
      .collection("tractor_employee_transactions")
      .find(dateFilter)
      .sort({ date: -1 })
      .toArray();

    return transactions.map((transaction) => ({
      date: transaction.date,
      _id: transaction._id.toString(),
      employeeId: transaction.employeeId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch tractor employee dates:", error);
    return [];
  }
}

export async function addTractorEmployeeTransaction(
  employeeId: string,
  type: "debit" | "credit",
  amount: number,
  date: Date,
  description: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Verify employee exists
    const employee = await db
      .collection("tractor_employees")
      .findOne({ _id: new ObjectId(employeeId) });

    if (!employee) {
      return {
        success: false,
        error: "Tractor employee not found",
      };
    }

    await db.collection("tractor_employee_transactions").insertOne({
      employeeId: new ObjectId(employeeId),
      type,
      amount,
      date: new Date(date),
      description,
      createdAt: new Date(),
    });

    revalidatePath(`/tractor/employees`);
    revalidatePath(`/tractor/employees/${employeeId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add tractor employee transaction:", error);
    return {
      success: false,
      error: "Failed to add transaction",
    };
  }
}

export async function deleteTractorEmployeeTransaction(
  employeeId: string,
  transactionId: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const transaction = await db
      .collection("tractor_employee_transactions")
      .findOne({
        _id: new ObjectId(transactionId),
        employeeId: new ObjectId(employeeId),
      });

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    await db.collection("tractor_employee_transactions").deleteOne({
      _id: new ObjectId(transactionId),
    });

    revalidatePath(`/tractor/employees/${employeeId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tractor employee transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

export async function updateTractorEmployeeTransaction(
  employeeId: string,
  transactionId: string,
  type: "debit" | "credit",
  amount: number,
  date: Date,
  description: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const transaction = await db
      .collection("tractor_employee_transactions")
      .findOne({
        _id: new ObjectId(transactionId),
        employeeId: new ObjectId(employeeId),
      });

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    await db.collection("tractor_employee_transactions").updateOne(
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

    revalidatePath(`/tractor/employees/${employeeId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update tractor employee transaction:", error);
    return {
      success: false,
      error: "Failed to update transaction",
    };
  }
}
