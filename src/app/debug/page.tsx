
import { getDbV2 } from "@/lib/db/v2";
import { createFarmerConfig, addExpenseToConfig } from "@/lib/newActions/farmerActions";
import { ObjectId } from "mongodb";

export default async function DebugPage() {
  const db = await getDbV2();
  
  // 1. Create Config
  const createResult = await createFarmerConfig({
    name: "DEBUG_VERIFICATION_" + Date.now(),
    baseSharePercentage: 50,
    expenseConfigs: []
  });
  
  if (!createResult.success) {
      return <div>Failed to create config</div>;
  }
  
  const configId = createResult.id;

  // 2. Add Expense Override
  const dummyCategoryId = new ObjectId().toString();
  await addExpenseToConfig(configId, {
    categoryId: dummyCategoryId,
    category: "TEST_GROUP",
    itemName: "TEST_ITEM",
    farmerShare: 60,
    ownerShare: 40
  });

  // 3. Verify
  const config = await db.collection("farmerConfigs").findOne({ _id: new ObjectId(configId) });
  
  return (
    <pre>{JSON.stringify(config, null, 2)}</pre>
  );
}
