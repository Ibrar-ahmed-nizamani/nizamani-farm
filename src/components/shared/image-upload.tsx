"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (formData: FormData) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
  onDelete?: () => Promise<{ success: boolean; error?: string }>;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export default function ImageUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  size = "md",
  className,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState(Date.now());
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    const formData = new FormData();
    formData.append("image", file);

    startTransition(async () => {
      const result = await onUpload(formData);
      if (!result.success) {
        setPreview(null);
        alert(result.error || "Failed to upload image");
      } else {
        // Update version to bust cache
        setImageVersion(Date.now());
        // Clear preview after successful upload (will use the new URL)
        setPreview(null);
      }
    });

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!onDelete) return;

    startTransition(async () => {
      const result = await onDelete();
      if (result.success) {
        setPreview(null);
        setImageVersion(Date.now());
      } else {
        alert(result.error || "Failed to delete image");
      }
    });
    setShowDeleteDialog(false);
  };

  // Add cache-busting query param to image URL
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    // Add timestamp to prevent caching issues
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${imageVersion}`;
  };

  const displayImage = preview || getImageUrl(currentImageUrl);

  return (
    <>
      <div className={cn("relative group", sizeClasses[size], className)}>
        {/* Image or placeholder */}
        <div
          className={cn(
            "w-full h-full rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/30",
            "flex items-center justify-center bg-muted cursor-pointer",
            "transition-all hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && !isPending && inputRef.current?.click()}
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt="Uploaded image"
              fill
              className="object-cover"
              unoptimized // Disable Next.js image optimization to ensure fresh images
            />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" />
          )}

          {/* Loading overlay */}
          {isPending && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Camera overlay on hover */}
        {!isPending && !disabled && (
          <div
            className={cn(
              "absolute inset-0 bg-black/40 rounded-full flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            )}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Delete button */}
        {displayImage && onDelete && !isPending && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDeleteClick}
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isPending}
        />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
