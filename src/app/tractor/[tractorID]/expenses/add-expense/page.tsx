import AddTractorExpenseForm from "@/components/tractor/add-expense-form";
import TractorName from "@/components/tractor/tractor-name";
import { Button } from "@/components/ui/button";
import { getTractorDetails } from "@/lib/actions/tractor";
import Link from "next/link";

export default async function AddExpensePage({
  params,
}: {
  params: Promise<{ tractorID: string }>;
}) {
  const tractorID = (await params).tractorID;

  const tractorDetails = await getTractorDetails(tractorID);

  return (
    <div>
      <div className="flex justify-between items-center">
        <TractorName
          tractorName={tractorDetails.tractorName}
          tractorModel={tractorDetails.tractorModel}
        />
        <Button asChild variant="link">
          <Link href={`/tractor/${tractorID}/expenses`}>
            ← Back to expenses
          </Link>
        </Button>
      </div>
      <h2 className="text-xl font-semi mb-6">Add Tractor Expense</h2>
      <AddTractorExpenseForm tractorId={tractorID} />
    </div>
  );
}
