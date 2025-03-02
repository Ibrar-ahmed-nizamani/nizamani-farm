import AddFarmerForm from "@/components/fields/add-farmer";
import BackLink from "@/components/ui/back-link";
import { getRemainingArea } from "@/lib/actions/field";

export default async function AddFarmerPage({
  params,
}: {
  params: Promise<{ fieldId: string }>;
}) {
  const fieldId = (await params).fieldId;

  const { remainingArea } = await getRemainingArea(fieldId);
  console.log(remainingArea);
  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Add Farmer</h1>
          <p className="text-muted-foreground">
            Remaining Area: {remainingArea} acres
          </p>
        </div>
        <BackLink href={`/fields/${fieldId}`} linkText="Back to Field" />
      </div>
      <AddFarmerForm fieldId={fieldId} maxArea={remainingArea} />
    </section>
  );
}
