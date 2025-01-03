import { getWorkById } from "@/lib/actions/work";
import { AddTractorWorkForm } from "@/components/tractor/work-form";
import TractorName from "@/components/tractor/tractor-name";
import { getTractorDetails } from "@/lib/actions/tractor";
import BackButton from "@/components/shared/back-button";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ tractorID: string; workId: string }>;
}) {
  const tractorID = (await params).tractorID;
  const workId = (await params).workId;
  const work = await getWorkById(workId);
  const tractorDetails = await getTractorDetails(tractorID);
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
      />
    </div>
  );
}
