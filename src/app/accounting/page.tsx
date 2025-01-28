import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AccountingPage() {
  return (
    <section className="flex flex-col  gap-6">
      <Button asChild size="lg" variant="outline" className="max-w-56">
        <Link href="/accounting/tractor">Go To Tractor Accounting</Link>
      </Button>
    </section>
  );
}
