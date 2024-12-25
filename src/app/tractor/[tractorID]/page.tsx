import EmptyTractorData from "@/components/shared/empty-tractor-data";
import TractorWorkTable from "@/components/tractor/work-table";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { getTractorWorks } from "@/lib/actions/work";
import { getTractorDetails } from "@/lib/actions/tractor";

export default async function TractorDetailPage({
  params,
}: {
  params: Promise<{ tractorID: string }>;
}) {
  const tractorID = (await params).tractorID;

  const works = await getTractorWorks(tractorID);
  const tractorDetails = await getTractorDetails(tractorID);
  console.log(tractorDetails);
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-xl font-semibold">{tractorDetails.tractorName}</h2>
        <CardDescription className="text-base">
          {tractorDetails.tractorModel}
        </CardDescription>
      </div>
      <h3 className="text-xl mb-3">Tractor Works List</h3>
      <Button asChild size="lg" className="mb-4">
        <Link href={`/tractor/${tractorID}/add-work`}>Add Work</Link>
      </Button>
      {works.length === 0 ? (
        <EmptyTractorData title="work" />
      ) : (
        <TractorWorkTable tractorWorks={works} />
      )}
    </section>
  );
}
