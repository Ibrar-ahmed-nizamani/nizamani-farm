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
  const [work, tractorDetails, equipmentRates] = await Promise.all([
    getWorkById(workId),
    getTractorDetails(tractorID),
    getEquipmentRates(),
  ]);
  console.log(work);
  // console.log(equipmentRates);

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
        initialData={work}
        isEditing={true}
        tractorID={tractorID}
        equipmentRates={equipmentRates}
      />
    </div>
  );
}
