import EmptyTractorData from "@/components/shared/empty-tractor-data";
import { TractorItem } from "@/components/tractor/tractor-item";
import { Button } from "@/components/ui/button";
import { getTractors } from "@/lib/actions/tractor";
import Link from "next/link";

export default async function TractorPage() {
  const tractorsData = await getTractors();
  return (
    <section>
      <div className="space-x-6">
        <Button asChild size="lg">
          <Link href="/tractor/add-tractor">Add Tractor</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/tractor/equipment-rates"> Change Equipment Rates</Link>
        </Button>
      </div>
      {tractorsData.length > 0 ? (
        <div className="my-8">
          {tractorsData.map((tractor) => {
            return (
              <TractorItem
                key={tractor.id}
                name={tractor.tractorName}
                model={tractor.tractorModel}
                id={tractor.id}
              />
            );
          })}
        </div>
      ) : (
        <EmptyTractorData title="tractor" />
      )}
    </section>
  );
}
