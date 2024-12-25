import clientPromise from "./mongodb";

// Helper function to get all tractors
export async function getTractors() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const tractors = await db
      .collection("tractors")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return tractors;
  } catch (error) {
    console.error("Failed to fetch tractors:", error);
    throw new Error("Failed to fetch tractors");
  }
}
