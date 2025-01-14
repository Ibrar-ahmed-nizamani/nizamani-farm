"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { createBackup } from "@/lib/backup";
import { useToast } from "@/hooks/use-toast";

const BackupButton = () => {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const handleBackup = async () => {
    startTransition(async () => {
      try {
        const result = await createBackup();

        if (!result.success) {
          throw new Error(result.error);
        }

        // Convert base64 to blob
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/zip" });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Backup Created",
          description: "Your database backup has been downloaded successfully.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Backup Failed",
          description:
            error.message || "There was an error creating the backup.",
        });
      }
    });
  };

  return (
    <Button
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
