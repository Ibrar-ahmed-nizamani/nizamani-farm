import BackButton from "@/components/shared/back-button";
import AddTractorExpenseForm from "@/components/tractor/add-expense-form";
import TractorName from "@/components/tractor/tractor-name";
import { getTractorDetails } from "@/lib/actions/tractor";

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
        <BackButton />
      </div>
      <h2 className="text-xl font-semi mb-6">Add Tractor Expense</h2>
      <AddTractorExpenseForm tractorId={tractorID} />
    </div>
  );
}
