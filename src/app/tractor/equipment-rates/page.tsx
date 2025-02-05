import EquipmentRatesForm from "@/components/settings/equipment-rates-form";
import BackButton from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { getEquipmentRates } from "@/lib/actions/equipment-rate";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function EquipmentRatesPage() {
  const equipmentRates = await getEquipmentRates();
  return (
    <section className="mx-auto space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Equipment Rates Settings</h1>
        <div className="flex gap-4">
          <Link href="/tractor/equipment-rates/add-equipment">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </Link>
          <BackButton />
        </div>
      </div>
      <EquipmentRatesForm initialRates={equipmentRates} />
    </section>
  );
}
