import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}

export default function EmptyState({
  title,
  description,
  link,
  linkText,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {link && linkText && (
        <Link href={link} className="mt-6">
          <Button>
            {linkText}
          </Button>
        </Link>
      )}
    </div>
  );
} 