/**
 * Test Script for Field Implementation
 *
 * This script tests the new field creation functionality and database performance
 *
 * Usage: node scripts/test-field-implementation.js
 */

import {
  addField,
  getExistingFieldNames,
  getUniqueFieldNames,
} from "../src/lib/actions/NewField.ts";
import {
  setupFieldIndexes,
  getIndexInfo,
} from "../src/lib/db/setup-indexes.ts";

async function testFieldCreation() {
  console.log("🧪 Testing Field Creation...\n");

  const testCases = [
    {
      name: "Test Field 1",
      year: 2024,
      totalArea: 10.5,
      expectedResult: true,
      description: "Valid field creation",
    },
    {
      name: "Test Field 1", // Same name
      year: 2024, // Same year
      totalArea: 15.0,
      expectedResult: false,
      description: "Duplicate field name and year (should fail)",
    },
    {
      name: "Test Field 1", // Same name
      year: 2023, // Different year
      totalArea: 12.0,
      expectedResult: true,
      description: "Same name but different year (should succeed)",
    },
    {
      name: "  Test Field 2  ", // With spaces
      year: 2024,
      totalArea: 8.5,
      expectedResult: true,
      description: "Field name with spaces (should be trimmed)",
    },
    {
      name: "A", // Too short
      year: 2024,
      totalArea: 5.0,
      expectedResult: false,
      description: "Too short name (should fail)",
    },
    {
      name: "Valid Field",
      year: 2019, // Invalid year
      totalArea: 5.0,
      expectedResult: false,
      description: "Invalid year (should fail)",
    },
    {
      name: "Valid Field",
      year: 2024,
      totalArea: -5.0, // Invalid area
      expectedResult: false,
      description: "Negative area (should fail)",
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const [index, testCase] of testCases.entries()) {
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(
      `  Input: name="${testCase.name}", year=${testCase.year}, area=${testCase.totalArea}`
    );

    try {
      const result = await addField(
        testCase.name,
        testCase.year,
        testCase.totalArea
      );

      if (result.success === testCase.expectedResult) {
        console.log(
          `  ✅ PASSED - ${
            result.success
              ? "Created successfully"
              : `Failed as expected: ${result.error}`
          }`
        );
        passed++;
      } else {
        console.log(
          `  ❌ FAILED - Expected ${
            testCase.expectedResult ? "success" : "failure"
          }, got ${result.success ? "success" : "failure"}`
        );
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ FAILED - Unexpected error: ${error.message}`);
      failed++;
    }

    console.log("");
  }

  console.log(`📊 Test Results: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

async function testFieldNameRetrieval() {
  console.log("🧪 Testing Field Name Retrieval...\n");

  try {
    console.log("Getting existing field names with years...");
    const existingNames = await getExistingFieldNames();
    console.log("Existing fields:", existingNames);

    console.log("\nGetting unique field names...");
    const uniqueNames = await getUniqueFieldNames();
    console.log("Unique field names:", uniqueNames);

    console.log("✅ Field name retrieval test passed\n");
    return true;
  } catch (error) {
    console.log(`❌ Field name retrieval test failed: ${error.message}\n`);
    return false;
  }
}

async function testDatabaseIndexes() {
  console.log("🧪 Testing Database Indexes...\n");

  try {
    console.log("Setting up indexes...");
    const setupResult = await setupFieldIndexes();

    if (!setupResult.success) {
      console.log(`❌ Index setup failed: ${setupResult.error}`);
      return false;
    }

    console.log("Getting index information...");
    const indexInfo = await getIndexInfo();

    // Check if required indexes exist
    const requiredIndexes = {
      new_fields: [
        "unique_field_name_year",
        "field_name_lookup",
        "field_creation_date",
      ],
      new_transactions: [
        "field_transactions_by_date",
        "farmer_field_transactions",
        "field_transaction_type_date",
        "transaction_date",
      ],
      new_farmers: ["farmer_name_lookup", "farmer_working_fields"],
      new_expense_shares: ["expense_share_farmer_type", "expense_share_name"],
    };

    let allIndexesPresent = true;

    for (const [collection, expectedIndexes] of Object.entries(
      requiredIndexes
    )) {
      const collectionIndexes = indexInfo[collection] || [];
      const indexNames = collectionIndexes.map((idx) => idx.name);

      console.log(`\n${collection} indexes:`);
      for (const expectedIndex of expectedIndexes) {
        if (indexNames.includes(expectedIndex)) {
          console.log(`  ✅ ${expectedIndex}`);
        } else {
          console.log(`  ❌ Missing: ${expectedIndex}`);
          allIndexesPresent = false;
        }
      }
    }

    if (allIndexesPresent) {
      console.log("\n✅ All required indexes are present");
      return true;
    } else {
      console.log("\n❌ Some required indexes are missing");
      return false;
    }
  } catch (error) {
    console.log(`❌ Database index test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting Field Implementation Tests...\n");

  const results = {
    fieldCreation: await testFieldCreation(),
    fieldRetrieval: await testFieldNameRetrieval(),
    databaseIndexes: await testDatabaseIndexes(),
  };

  console.log("=" * 50);
  console.log("📋 FINAL TEST RESULTS");
  console.log("=" * 50);

  if (results.fieldCreation.passed > 0) {
    console.log(
      `✅ Field Creation: ${results.fieldCreation.passed}/${
        results.fieldCreation.passed + results.fieldCreation.failed
      } tests passed`
    );
  } else {
    console.log(`❌ Field Creation: All tests failed`);
  }

  console.log(
    `${results.fieldRetrieval ? "✅" : "❌"} Field Name Retrieval: ${
      results.fieldRetrieval ? "PASSED" : "FAILED"
    }`
  );
  console.log(
    `${results.databaseIndexes ? "✅" : "❌"} Database Indexes: ${
      results.databaseIndexes ? "PASSED" : "FAILED"
    }`
  );

  const overallSuccess =
    results.fieldCreation.failed === 0 &&
    results.fieldRetrieval &&
    results.databaseIndexes;

  console.log(
    `\n🎯 Overall Result: ${
      overallSuccess ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
    }`
  );

  if (overallSuccess) {
    console.log("\n🎉 Your field implementation is ready for production!");
  } else {
    console.log(
      "\n⚠️ Please fix the failing tests before using in production."
    );
  }
}

// Handle script execution
if (require.main === module) {
  runAllTests().catch(console.error);
}
