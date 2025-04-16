import AddFieldForm from "@/components/fields/add-field";
import BackButton from "@/components/shared/back-button";

export default function AddFieldPage() {
  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add Field</h1>
        <BackButton />
      </div>
      <AddFieldForm />
    </section>
  );
}
