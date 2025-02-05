import AddEquipmentForm from "@/components/settings/add-equipment-form";
import BackButton from "@/components/shared/back-button";

export default function AddEquipmentPage() {
  return (
    <section className="mx-auto space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Add New Equipment</h1>
        <BackButton />
      </div>
      <AddEquipmentForm />
    </section>
  );
}
