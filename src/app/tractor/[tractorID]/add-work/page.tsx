import { EquipmentRateForm } from "@/components/tractor/equipment-rates-form";
import { ExpenseForm } from "@/components/tractor/work-form";
import { CardDescription } from "@/components/ui/card";
import { getTractorDetails } from "@/lib/actions/tractor";

export default async function AddTractorWorkPage({
  params,
}: {
  params: Promise<{ tractorID: string }>;
}) {
  const tractorID = (await params).tractorID;
  const tractorDetails = await getTractorDetails(tractorID);

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-xl font-semibold">{tractorDetails.tractorName}</h2>
        <CardDescription className="text-base">
          {tractorDetails.tractorModel}
        </CardDescription>
      </div>
      <EquipmentRateForm />
      <ExpenseForm tractorID={tractorID} />
    </section>
  );
}
