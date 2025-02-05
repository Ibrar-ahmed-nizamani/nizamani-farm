import EquipmentRatesForm from "@/components/settings/equipment-rates-form";
import BackButton from "@/components/shared/back-button";
import { getEquipmentRates } from "@/lib/actions/equipment-rate";

export default async function EquipmentRatesPage() {
  const equipmentRates = await getEquipmentRates();
  return (
    <section className="mx-auto space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Equipment Rates Settings</h1>
        <div className="flex gap-4">
          <BackButton />
        </div>
      </div>
      <EquipmentRatesForm initialRates={equipmentRates} />
    </section>
  );
}
