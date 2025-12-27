"use server";

import sharp from "sharp";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { getDbV2 } from "@/lib/db/v2";
import { ObjectId } from "mongodb";

// Configuration for different image types
export type ImageCategory = "farmer" | "receipt" | "field";

interface ImageConfig {
  directory: string;
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

const IMAGE_CONFIGS: Record<ImageCategory, ImageConfig> = {
  farmer: {
    directory: "farmer-images",
    maxWidth: 800,
    maxHeight: 800,
    quality: 90,
  },
  receipt: {
    directory: "receipt-images",
    maxWidth: 1200,
    maxHeight: 1600,
    quality: 85,
  },
  field: {
    directory: "field-images",
    maxWidth: 800,
    maxHeight: 600,
    quality: 80,
  },
};

/**
 * Generic image upload function that handles compression and saving
 * @param imageData - Base64 encoded image or File from FormData
 * @param id - Unique identifier for the image (e.g., farmerId)
 * @param category - Type of image (farmer, receipt, field)
 * @returns The public URL path of the saved image
 */
export async function uploadImage(
  imageData: string | File,
  id: string,
  category: ImageCategory
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const config = IMAGE_CONFIGS[category];
    const publicDir = path.join(process.cwd(), "public", config.directory);

    // Ensure directory exists
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }

    // Convert input to buffer
    let buffer: Buffer;
    if (typeof imageData === "string") {
      // Base64 string
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    } else {
      // File object
      const arrayBuffer = await imageData.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Process image with sharp
    const processedImage = await sharp(buffer)
      .resize(config.maxWidth, config.maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: config.quality })
      .toBuffer();

    // Generate filename and save
    const filename = `${id}.jpg`;
    const filepath = path.join(publicDir, filename);
    await writeFile(filepath, processedImage);

    // Return public URL
    const imageUrl = `/${config.directory}/${filename}`;
    return { success: true, imageUrl };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

/**
 * Delete an image file
 */
export async function deleteImage(
  id: string,
  category: ImageCategory
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = IMAGE_CONFIGS[category];
    const filepath = path.join(
      process.cwd(),
      "public",
      config.directory,
      `${id}.jpg`
    );

    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

// --- Farmer-specific image functions ---

export async function uploadFarmerImage(farmerId: string, formData: FormData) {
  const file = formData.get("image") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "No image provided" };
  }

  // Upload and compress image
  const result = await uploadImage(file, farmerId, "farmer");

  if (result.success && result.imageUrl) {
    // Update farmer record in database
    const db = await getDbV2();
    await db.collection("farmers").updateOne(
      { _id: new ObjectId(farmerId) },
      { $set: { imageUrl: result.imageUrl, updatedAt: new Date() } }
    );

    revalidatePath("/farmers");
    revalidatePath(`/farmers/${farmerId}`);
  }

  return result;
}

export async function deleteFarmerImage(farmerId: string) {
  // Delete image file
  const result = await deleteImage(farmerId, "farmer");

  if (result.success) {
    // Clear imageUrl from database
    const db = await getDbV2();
    await db.collection("farmers").updateOne(
      { _id: new ObjectId(farmerId) },
      { $set: { imageUrl: null, updatedAt: new Date() } }
    );

    revalidatePath("/farmers");
    revalidatePath(`/farmers/${farmerId}`);
  }

  return result;
}
