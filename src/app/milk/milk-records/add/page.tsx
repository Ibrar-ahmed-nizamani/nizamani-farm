import AddMilkForm from "@/components/milk/add-milk-form";
import BackLink from "@/components/ui/back-link";

export default function AddMilkPage() {
  return (
    <div className=" mx-auto  space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Milk Record</h1>
        <BackLink href="/milk/milk-records" linkText="Back to Milk Records" />
      </div>
      <AddMilkForm />
    </div>
  );
}
