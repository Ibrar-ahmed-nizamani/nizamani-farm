import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    // Test the connection
    await db.command({ ping: 1 });

    // List all collections
    const collections = await db.listCollections().toArray();

    // Count documents in tractors collection
    const tractorCount = await db.collection("tractors").countDocuments();

    return NextResponse.json({
      status: "Connected",
      database: "farm",
      collections: collections.map((c) => c.name),
      tractorCount,
    });
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json(
      { error: "Failed to connect to database", details: error },
      { status: 500 }
    );
  }
}
