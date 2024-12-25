import { useFormStatus } from "react-dom";
import { Button } from "./button";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

export default function FormActionButton({
  children,
}: {
  children: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>{children}</>
      )}
    </Button>
  );
}
