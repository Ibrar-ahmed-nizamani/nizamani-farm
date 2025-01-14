// components/backup-button.tsx
"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { createBackup } from "@/lib/backup";
import { BackupResult } from "@/lib/type-definitions";

const BackupButton: React.FC = () => {
  const [isPending, startTransition] = useTransition();

  const handleBackup = () => {
    startTransition(async () => {
      try {
        const result: BackupResult = await createBackup();

        if (!result.success) {
          throw new Error(result.error);
        }

        // Convert base64 to blob
        const byteCharacters = atob(result.data!);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: "application/zip" });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename!;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch {
        console.error("Something went wrong while downloading backup");
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleBackup}
      disabled={isPending}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {isPending ? "Creating Backup..." : "Backup Database"}
    </Button>
  );
};

export default BackupButton;
