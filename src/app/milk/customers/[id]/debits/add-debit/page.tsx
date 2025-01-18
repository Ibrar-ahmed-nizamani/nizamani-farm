// app/milk/customers/[id]/debits/add-debit/page.tsx
import AddDebitForm from "@/components/milk/customer/add-debit-form";
import BackButton from "@/components/shared/back-button";
import { getMilkCustomer } from "@/lib/actions/milk-customer-actions";

export default async function AddDebitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const customer = await getMilkCustomer(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add Debit - {customer.name}</h1>
        <BackButton />
      </div>
      <AddDebitForm customerId={id} />
    </div>
  );
}
