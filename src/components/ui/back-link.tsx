import Link from "next/link";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

export default function BackLink({
  href,
  linkText,
}: {
  href: string;
  linkText: string;
}) {
  return (
    <Button variant="link" asChild>
      <Link href={href} className="flex items-center gap-2">
        <ArrowLeft className="size-4 " /> {linkText}
      </Link>
    </Button>
  );
}
