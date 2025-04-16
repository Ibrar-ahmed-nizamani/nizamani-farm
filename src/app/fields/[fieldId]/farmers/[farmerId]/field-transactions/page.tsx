// app/fields/[fieldId]/farmers/[farmerId]/add-transaction/page.tsx
// app/fields/[fieldId]/farmers/[farmerId]/add-transaction/page.tsx

import { Suspense } from "react";
import { getFieldFarmer } from "@/lib/actions/farmer";
import { getFieldShareExpenses } from "@/lib/actions/share-settings";
import BackLink from "@/components/ui/back-link";
import AddTransactionForm from "@/components/fields/farmer-transactions/add-field-transaction";

export default async function AddFieldTransactionPage({
  params,
}: {
  params: Promise<{ fieldId: string; farmerId: string }>;
}) {
  const { fieldId, farmerId } = await params;

  const farmer = await getFieldFarmer(farmerId);
  // Convert shareType format if needed (e.g., "HALF" to "1/2")
  const normalizedShareType =
    farmer.shareType === "1/2"
      ? "HALF"
      : farmer.shareType === "1/4"
      ? "QUARTER"
      : farmer.shareType === "1/3"
      ? "THIRD"
      : farmer.shareType;
  // Get expense types based on farmer's share type
  const expenseTypes = await getFieldShareExpenses(normalizedShareType);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Add Field Transaction</h1>
          <p className="text-muted-foreground">
            Add a new transaction for {farmer.name} in {farmer.fieldName}
          </p>
        </div>
        <BackLink
          href={`/fields/${fieldId}/farmers/${farmerId}`}
          linkText="Back to Farmer"
        />
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <AddTransactionForm
          fieldId={fieldId}
          farmerId={farmerId}
          expenseTypes={expenseTypes}
        />
      </Suspense>
    </div>
  );
}
