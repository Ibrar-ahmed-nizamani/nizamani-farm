/**
 * Database Index Setup for Field Management System
 *
 * This script sets up the necessary indexes for optimal performance
 * based on the new field data model and aggregation queries.
 */

import clientPromise from "../mongodb";

export async function setupFieldIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    console.log("Setting up database indexes for optimal performance...");

    // Indexes for new_fields collection
    const fieldsCollection = db.collection("new_fields");

    // Compound index for unique field name + year constraint
    await fieldsCollection.createIndex(
      { name: 1, year: 1 },
      {
        unique: true,
        name: "unique_field_name_year",
      }
    );
    console.log("✅ Created unique index on name + year for new_fields");

    // Index for field name lookups (for getExistingFieldNames)
    await fieldsCollection.createIndex(
      { name: 1 },
      { name: "field_name_lookup" }
    );
    console.log("✅ Created index on name for new_fields");

    // Index for creation date queries
    await fieldsCollection.createIndex(
      { createdAt: -1 },
      { name: "field_creation_date" }
    );
    console.log("✅ Created index on createdAt for new_fields");

    // Indexes for new_transactions collection
    const transactionsCollection = db.collection("new_transactions");

    // Compound index for field-based queries (critical for aggregations)
    await transactionsCollection.createIndex(
      { fieldId: 1, createdAt: -1 },
      { name: "field_transactions_by_date" }
    );
    console.log(
      "✅ Created compound index on fieldId + createdAt for new_transactions"
    );

    // Index for farmer-specific queries
    await transactionsCollection.createIndex(
      { farmerId: 1, fieldId: 1, createdAt: -1 },
      { name: "farmer_field_transactions" }
    );
    console.log(
      "✅ Created compound index on farmerId + fieldId + createdAt for new_transactions"
    );

    // Index for transaction type queries
    await transactionsCollection.createIndex(
      { fieldId: 1, type: 1, createdAt: -1 },
      { name: "field_transaction_type_date" }
    );
    console.log(
      "✅ Created compound index on fieldId + type + createdAt for new_transactions"
    );

    // Index for date range queries
    await transactionsCollection.createIndex(
      { createdAt: -1 },
      { name: "transaction_date" }
    );
    console.log("✅ Created index on createdAt for new_transactions");

    // Indexes for new_farmers collection
    const farmersCollection = db.collection("new_farmers");

    // Index for farmer name lookups
    await farmersCollection.createIndex(
      { name: 1 },
      { name: "farmer_name_lookup" }
    );
    console.log("✅ Created index on name for new_farmers");

    // Index for working fields queries
    await farmersCollection.createIndex(
      { workingFields: 1 },
      { name: "farmer_working_fields" }
    );
    console.log("✅ Created index on workingFields for new_farmers");

    // Indexes for new_expense_shares collection
    const expenseSharesCollection = db.collection("new_expense_shares");

    // Index for farmer type queries
    await expenseSharesCollection.createIndex(
      { farmerType: 1 },
      { name: "expense_share_farmer_type" }
    );
    console.log("✅ Created index on farmerType for new_expense_shares");

    // Index for expense share name lookups
    await expenseSharesCollection.createIndex(
      { name: 1 },
      { name: "expense_share_name" }
    );
    console.log("✅ Created index on name for new_expense_shares");

    console.log("\n🎉 All indexes created successfully!");
    console.log("\nRecommended MongoDB Performance Tips:");
    console.log("1. Monitor query performance using db.collection.explain()");
    console.log(
      "2. Use MongoDB Compass or Atlas Performance Advisor to track slow queries"
    );
    console.log(
      "3. Consider adding more specific indexes if you notice slow queries"
    );
    console.log("4. Regularly review and optimize aggregation pipelines");

    return { success: true };
  } catch (error) {
    console.error("❌ Error setting up indexes:", error);
    return { success: false, error };
  }
}

export async function dropFieldIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    console.log("Dropping field-related indexes...");

    const collections = [
      "new_fields",
      "new_transactions",
      "new_farmers",
      "new_expense_shares",
    ];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);

      try {
        await collection.dropIndexes();
        console.log(`✅ Dropped indexes for ${collectionName}`);
      } catch (error) {
        console.log(
          `⚠️ No indexes to drop for ${collectionName} or error:`,
          error
        );
      }
    }

    console.log("🎉 Index cleanup completed!");
    return { success: true };
  } catch (error) {
    console.error("❌ Error dropping indexes:", error);
    return { success: false, error };
  }
}

// Helper function to get index information
export async function getIndexInfo() {
  try {
    const client = await clientPromise;
    const db = client.db("farm");

    const collections = [
      "new_fields",
      "new_transactions",
      "new_farmers",
      "new_expense_shares",
    ];
    const indexInfo: Record<string, any[]> = {};

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.listIndexes().toArray();
      indexInfo[collectionName] = indexes;
    }

    return indexInfo;
  } catch (error) {
    console.error("❌ Error getting index info:", error);
    return {};
  }
}
