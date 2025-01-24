import AddTractorEmployeeTransactionForm from "@/components/tractor/tractor-worker/add-transaction";
import { Button } from "@/components/ui/button";
import { getTractorEmployee } from "@/lib/actions/tractor-employee";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AddTractorEmployeeTransactionPage({
  params,
}: {
  params: Promise<{ employeeID: string }>;
}) {
  const id = (await params).employeeID;
  const employee = await getTractorEmployee(id);

  return (
    <section className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{employee.name}</h1>
        </div>
        <Button variant="link">
          <Link
            href={`/tractor/tractor-workers/${id}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4 " /> Back to Worker
          </Link>
        </Button>
      </div>
      <h2 className="text-lg font-semibold">Add Transaction</h2>
      <AddTractorEmployeeTransactionForm employeeId={id} />
    </section>
  );
}
