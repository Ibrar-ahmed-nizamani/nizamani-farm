import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Milk, UserPen, Users } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold border-b pb-2">Milk Management</h1>
      <div>
        <Button variant="outline" asChild className="min-w-44 ">
          <Link
            href="/milk/milk-records"
            className="flex  items-center border-b !justify-start"
          >
            <Milk className="h-6 w-6" />
            <span>Milk Records</span>
          </Link>
        </Button>
      </div>
      <div>
        <Button variant="outline" asChild className="min-w-44 ">
          <Link
            href="/milk/expenses"
            className="flex  items-center border-b !justify-start"
          >
            <DollarSign className="h-6 w-6 " />
            <span>Milk Expenses</span>
          </Link>
        </Button>
      </div>
      <div>
        <Button variant="outline" asChild className="min-w-44 ">
          <Link
            href="/milk/customers"
            className="flex  items-center border-b !justify-start"
          >
            <Users className="h-6 w-6 " />
            <span>Milk Customers</span>
          </Link>
        </Button>
      </div>
      <div>
        <Button variant="outline" asChild className="min-w-44 ">
          <Link
            href="/milk/workers"
            className="flex  items-center border-b !justify-start"
          >
            <UserPen className="h-6 w-6" />
            <span>Milk Workers</span>
          </Link>
        </Button>
      </div>
      <div>
        <Button variant="outline" asChild className="min-w-44 ">
          <Link
            href="/milk/milk-summary"
            className="flex  items-center border-b !justify-start"
          >
            <FileText className="h-6 w-6" />
            <span>Milk Summary</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
