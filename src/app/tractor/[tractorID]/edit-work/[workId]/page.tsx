import { getWorkById } from "@/lib/actions/work";
import { AddTractorWorkForm } from "@/components/tractor/work-form";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ tractorID: string; workId: string }>;
}) {
  const tractorID = (await params).tractorID;
  const workId = (await params).workId;
  const work = await getWorkById(workId);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Work</h1>
      <AddTractorWorkForm
        tractorID={tractorID}
        initialData={work}
        isEditing={true}
      />
    </div>
  );
}
