"use client";

import { createFarmer } from "@/lib/newActions/farmerActions";
import { uploadFarmerImage } from "@/lib/newActions/imageActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Camera, X } from "lucide-react";
import Image from "next/image";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Adding..." : "Add Farmer"}
    </Button>
  );
}

export default function AddFarmerModal({ configs }: { configs: { _id: string; name: string; baseSharePercentage: number }[] }) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function clientAction(formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const cnic = formData.get("cnic") as string;
    
    const result = await createFarmer({
      name,
      phone,
      cnic,
    });

    if (result.success) {
      // Upload image if selected
      if (selectedFile && result.id) {
        const imageFormData = new FormData();
        imageFormData.append("image", selectedFile);
        await uploadFarmerImage(result.id, imageFormData);
      }

      // Reset form state
      setImagePreview(null);
      setSelectedFile(null);
      setOpen(false);
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset on close
      setImagePreview(null);
      setSelectedFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Farmer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Farmer</DialogTitle>
          <DialogDescription>
            Create a new farmer profile. You can assign them to fields later.
          </DialogDescription>
        </DialogHeader>
        <form action={clientAction} className="space-y-4">
          {/* Image Upload Section */}
          <div className="flex justify-center">
            <div className="relative group">
              <div 
                className="h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/30 
                           flex items-center justify-center bg-muted cursor-pointer overflow-hidden
                           hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              
              {/* Remove image button */}
              {imagePreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Click to add a photo (optional)
          </p>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input id="phone" name="phone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnic">CNIC (Optional)</Label>
            <Input id="cnic" name="cnic" />
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
