import AddPaymentForm from "@/components/milk/customer/add-payment-form";
import { getMilkCustomer } from "@/lib/actions/milk-customer-actions";

export default async function AddPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const customer = await getMilkCustomer(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add Payment - {customer.name}</h1>
      </div>
      <AddPaymentForm customerId={id} />
    </div>
  );
}
