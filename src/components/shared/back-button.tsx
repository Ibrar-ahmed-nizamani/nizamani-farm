"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="link"
      className={`gap-2 ${className}`}
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
      Go Back
    </Button>
  );
}
