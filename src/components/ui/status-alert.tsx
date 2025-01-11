"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";

interface StatusProps {
  type: "success" | "error";
  message: string | null;
}

interface StatusAlertProps {
  status: StatusProps;
  onStatusChange?: (newStatus: StatusProps | null) => void;
}

export default function StatusAlert({
  status,
  onStatusChange,
}: StatusAlertProps) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (status.type === "success" && status.message) {
      timeoutId = setTimeout(() => {
        onStatusChange?.(null);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [status, onStatusChange]);

  if (!status.message) return null;

  return (
    <Alert
      variant={status.type === "success" ? "default" : "destructive"}
      className={`flex items-center gap-3 ${
        status.type === "success"
          ? "border-green-500 bg-green-50 text-green-700"
          : ""
      }`}
    >
      <div>
        {status.type === "success" ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
      </div>
      {/* <AlertTitle className={status.type === "success" ? "text-green-700" : ""}>
        {status.type === "success" ? "Success" : "Error"}
      </AlertTitle> */}
      <AlertDescription
        className={status.type === "success" ? "text-green-600" : ""}
      >
        {status.message}
      </AlertDescription>
    </Alert>
  );
}
