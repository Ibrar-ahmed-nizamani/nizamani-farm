import EquipmentRatesForm from "@/components/settings/equipment-rates-form";
import BackButton from "@/components/shared/back-button";
import { getEquipmentRates } from "@/lib/actions/equipment-rate";


export default async function EquipmentRatesPage() {
  const equipmentRates = await getEquipmentRates();
  console.log(equipmentRates);
  return (
    <section className="mx-auto space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Equipment Rates Settings</h1>
        <BackButton />
      </div>
      <EquipmentRatesForm initialRates={equipmentRates} />
    </section>
  );
}
