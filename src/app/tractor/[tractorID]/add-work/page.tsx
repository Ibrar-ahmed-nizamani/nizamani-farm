import { AddTractorWorkForm } from "@/components/tractor/work-form";
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
    <section className="space-y-4">
      <div className="mb-3">
        <h2 className="text-xl font-semibold">{tractorDetails.tractorName}</h2>
        <CardDescription className="text-base">
          {tractorDetails.tractorModel}
        </CardDescription>
      </div>
      <h3 className="text-lg font-semibold">Add Tractor Work</h3>
      {/* <EquipmentRateForm /> */}
      <AddTractorWorkForm tractorID={tractorID} />
    </section>
  );
}
