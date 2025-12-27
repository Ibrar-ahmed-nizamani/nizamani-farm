"use client";

import { uploadFarmerImage, deleteFarmerImage } from "@/lib/newActions/imageActions";
import ImageUpload from "@/components/shared/image-upload";
import { useRouter } from "next/navigation";

interface FarmerImageUploadProps {
  farmerId: string;
  currentImageUrl?: string | null;
  farmerName: string;
}

export default function FarmerImageUpload({
  farmerId,
  currentImageUrl,
  farmerName,
}: FarmerImageUploadProps) {
  const router = useRouter();

  const handleUpload = async (formData: FormData) => {
    const result = await uploadFarmerImage(farmerId, formData);
    if (result.success) {
      // Force refresh to update all cached data
      router.refresh();
    }
    return result;
  };

  const handleDelete = async () => {
    const result = await deleteFarmerImage(farmerId);
    if (result.success) {
      // Force refresh to update all cached data
      router.refresh();
    }
    return result;
  };

  return (
    <ImageUpload
      currentImageUrl={currentImageUrl}
      onUpload={handleUpload}
      onDelete={handleDelete}
      size="lg"
    />
  );
}
