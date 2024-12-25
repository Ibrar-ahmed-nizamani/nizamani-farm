"use server";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WithId, Document, ObjectId } from "mongodb";

interface TractorData {
  tractorName: string;
  tractorModel: string;
}

type ActionState = {
  error?: string;
  message?: string;
};

export async function addTractor(prevState: ActionState, formData: FormData) {
  const client = await clientPromise;
  const db = client.db("farm");

  const tractorData: TractorData = {
    tractorName: formData.get("tractorName") as string,
    tractorModel: formData.get("tractorModel") as string,
  };

  // Validate data
  if (!tractorData.tractorName || !tractorData.tractorModel) {
    return { error: "All fields are required" };
  }

  try {
    // Check if tractor with same name already exists
    const existingTractor = await db
      .collection("tractors")
      .findOne({ tractorName: tractorData.tractorName });

    if (existingTractor) {
      return { error: "Tractor with this name already exists" };
    }

    // Insert the tractor
    await db.collection("tractors").insertOne({
      ...tractorData,
      createdAt: new Date(),
      works: [], // Reference to work IDs
    });

    revalidatePath("/tractor");
  } catch (error) {
    console.error("Failed to add tractor:", error);
    return { error: "Failed to add tractor" };
  }

  // Redirect outside of try-catch
  redirect("/tractor");
}

interface Tractor {
  id: string;
  tractorName: string;
  tractorModel: string;
  createdAt: Date;
  works: string[];
}

export async function getTractors(): Promise<Tractor[]> {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const tractors = await db
      .collection("tractors")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return tractors.map((doc: WithId<Document>) => ({
      id: doc._id.toString(),
      tractorName: doc.tractorName as string,
      tractorModel: doc.tractorModel as string,
      createdAt: doc.createdAt as Date,
      works: doc.works as string[],
    }));
  } catch (error) {
    console.error("Failed to fetch tractors:", error);
    return [];
  }
}

export async function getTractorDetails(tractorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const tractor = await db
      .collection("tractors")
      .findOne({ _id: new ObjectId(tractorId) });

    if (!tractor) {
      throw new Error("Tractor not found");
    }

    // Return only the necessary fields
    return {
      id: tractor._id.toString(),
      tractorName: tractor.tractorName,
      tractorModel: tractor.tractorModel,
    };
  } catch (error) {
    console.error("Failed to fetch tractor details:", error);
    throw new Error("Failed to fetch tractor details");
  }
}
