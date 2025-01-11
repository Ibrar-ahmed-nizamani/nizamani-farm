import { getWorkById } from "@/lib/actions/work";
import { AddTractorWorkForm } from "@/components/tractor/work-form";
import TractorName from "@/components/tractor/tractor-name";
import { getTractorDetails } from "@/lib/actions/tractor";
import BackButton from "@/components/shared/back-button";
import { getEquipmentRates } from "@/lib/actions/equipment-rate";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ tractorID: string; workId: string }>;
}) {
  const tractorID = (await params).tractorID;
  const workId = (await params).workId;
  const [work, tractorDetails, rates] = await Promise.all([
    getWorkById(workId),
    getTractorDetails(tractorID),
    getEquipmentRates(),
  ]);

  return (
    <div>
      <div className="mb-3 flex justify-between items-start">
        <div>
          <TractorName
            tractorName={tractorDetails.tractorName}
            tractorModel={tractorDetails.tractorModel}
          />
        </div>
        <BackButton />
      </div>
      <h1 className="text-2xl font-bold mb-6">Edit Work</h1>
      <AddTractorWorkForm
        tractorID={tractorID}
        initialData={work}
        isEditing={true}
        cultivatorRate={rates.find((r) => r.name === "Cultivator")?.rate || 0}
        bladeRate={rates.find((r) => r.name === "Blade")?.rate || 0}
        laserRate={rates.find((r) => r.name === "Laser")?.rate || 0}
        gobalRate={rates.find((r) => r.name === "Gobal")?.rate || 0}
        rajaRate={rates.find((r) => r.name === "Raja")?.rate || 0}
      />
    </div>
  );
}
