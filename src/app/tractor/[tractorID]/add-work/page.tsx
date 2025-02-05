import TractorName from "@/components/tractor/tractor-name";
import { AddTractorWorkForm } from "@/components/tractor/work-form";
import { Button } from "@/components/ui/button";
import { getEquipmentRates } from "@/lib/actions/equipment-rate";
import { getTractorDetails } from "@/lib/actions/tractor";
import Link from "next/link";

export default async function AddTractorWorkPage({
  params,
}: {
  params: Promise<{ tractorID: string }>;
}) {
  const tractorID = (await params).tractorID;
  const tractorDetails = await getTractorDetails(tractorID);
  const equipmentRates = await getEquipmentRates();

  return (
    <section className="space-y-4">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <TractorName
            tractorName={tractorDetails.tractorName}
            tractorModel={tractorDetails.tractorModel}
          />
        </div>
        <Button asChild variant="link">
          <Link href={`/tractor/${tractorID}`}>← Back to tractor</Link>
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Add Tractor Work</h3>
        <Button asChild size="lg" variant="outline">
          <Link href="/tractor/equipment-rates">Change Equipment Rates</Link>
        </Button>
      </div>

      <AddTractorWorkForm
        tractorID={tractorID}
        equipmentRates={equipmentRates}
      />
    </section>
  );
}
