import EmptyTractorData from "@/components/shared/empty-tractor-data";
import { TractorItem } from "@/components/tractor/tractor-item";
import { Button } from "@/components/ui/button";
import { getTractors } from "@/lib/actions/tractor";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function TractorPage() {
  const tractorsData = await getTractors();
  return (
    <section>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <Button asChild size="lg">
            <Link href="/tractor/add-tractor">Add Tractor</Link>
          </Button>

          <Link href="/tractor/equipment-rates/add-equipment">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </Link>
          <Button asChild size="lg" variant="outline">
            <Link href="/tractor/equipment-rates"> Change Equipment Rates</Link>
          </Button>
        </div>
        <Button asChild size="lg" variant="outline">
          <Link href="/tractor/tractor-workers"> Tractor Workers</Link>
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
