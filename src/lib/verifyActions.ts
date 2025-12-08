
import { createFarmerConfig, addExpenseToConfig, getFarmerConfigs } from "@/lib/newActions/farmerActions";
import { getDbV2 } from "@/lib/db/v2";
import { ObjectId } from "mongodb";

export async function verifyActions() {
  const db = await getDbV2();
  
  // 1. Create Config
  console.log("Creating config...");
  const createResult = await createFarmerConfig({
    name: "VERIFICATION_CONFIG_" + Date.now(),
    baseSharePercentage: 50,
    expenseConfigs: []
  });
  
  if (!createResult.success) {
    console.error("Failed to create config");
    return;
  }
  
  const configId = createResult.id;
  console.log("Config created with ID:", configId);
  
  // 2. Add Expense Override
  console.log("Adding expense override...");
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
  console.log("Config retrieved:");
  console.log(JSON.stringify(config, null, 2));
  
  const addedExpense = config?.expenseConfigs[0];
  if (addedExpense.category === "TEST_GROUP" && addedExpense.itemName === "TEST_ITEM" && !addedExpense.categoryName) {
      console.log("SUCCESS: Expense added correctly with separated fields.");
  } else {
      console.log("FAILURE: Expense structure is incorrect.");
      console.log("Expected category='TEST_GROUP', itemName='TEST_ITEM'.");
      console.log("Actual:", addedExpense);
  }
  
  // Cleanup
  await db.collection("farmerConfigs").deleteOne({ _id: new ObjectId(configId) });
}
