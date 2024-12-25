import AddTransactionForm from "@/components/accounting/tractor/add-transaction";
import { getCustomerName } from "@/lib/actions/customer";

export default async function Page({
  params,
}: {
  params: Promise<{ customerID: string }>;
}) {
  const customerId = (await params).customerID;
  const customerName = await getCustomerName(customerId);
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-semibold">
        {customerName?.name.charAt(0).toUpperCase() +
          customerName?.name.slice(1)}
      </h3>
      <AddTransactionForm customerId={customerId} />
    </section>
  );
}
