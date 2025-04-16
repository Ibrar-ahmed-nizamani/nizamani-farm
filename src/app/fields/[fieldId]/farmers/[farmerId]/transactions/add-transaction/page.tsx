// app/fields/[fieldId]/farmers/[farmerId]/add-transaction/page.tsx

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getField } from "@/lib/actions/field";

import { getFieldFarmer } from "@/lib/actions/farmer";
import FarmerTransactionForm from "@/components/fields/farmer-transactions/add-farmer-trans-form";

export default async function AddFarmerTransactionPage({
  params,
}: {
  params: Promise<{ fieldId: string; farmerId: string }>;
}) {
  const { fieldId, farmerId } = await params;
  const field = await getField(fieldId);
  const farmer = await getFieldFarmer(farmerId);

  return (
    <section className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{farmer.name}</h1>
          <p className="text-muted-foreground">
            Field: {field.name} - Allocated Area: {farmer.allocatedArea} acres
          </p>
        </div>
        <Button variant="link" asChild>
          <Link
            href={`/fields/${fieldId}/farmers/${farmerId}/transactions`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" /> Back to Transactions
          </Link>
        </Button>
      </div>
      <h2 className="text-lg font-semibold">Add Farmer Transaction</h2>
      <FarmerTransactionForm fieldId={fieldId} farmerId={farmerId} />
    </section>
  );
}
