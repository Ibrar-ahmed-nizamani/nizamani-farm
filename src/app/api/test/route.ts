import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("farm-project");

    // Test the connection
    await db.command({ ping: 1 });

    return NextResponse.json({ message: "Successfully connected to MongoDB" });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      { error: "Failed to connect to MongoDB" },
      { status: 500 }
    );
  }
}
