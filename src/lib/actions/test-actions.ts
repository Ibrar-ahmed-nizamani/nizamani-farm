"use server";

import {
  addField,
  getExistingFieldNames,
  getUniqueFieldNames,
} from "./NewField";
import { setupFieldIndexes, getIndexInfo } from "../db/setup-indexes";

export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface FieldCreationTestResult {
  passed: number;
  failed: number;
  testResults: Array<{
    description: string;
    input: string;
    result: "PASSED" | "FAILED";
    message: string;
  }>;
}

export async function runFieldCreationTests(): Promise<FieldCreationTestResult> {
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
  const testResults: FieldCreationTestResult["testResults"] = [];

  for (const testCase of testCases) {
    try {
      const result = await addField(
        testCase.name,
        testCase.year,
        testCase.totalArea
      );

      const inputStr = `name="${testCase.name}", year=${testCase.year}, area=${testCase.totalArea}`;

      if (result.success === testCase.expectedResult) {
        const message = result.success
          ? "Created successfully"
          : `Failed as expected: ${result.error}`;

        testResults.push({
          description: testCase.description,
          input: inputStr,
          result: "PASSED",
          message,
        });
        passed++;
      } else {
        const message = `Expected ${
          testCase.expectedResult ? "success" : "failure"
        }, got ${result.success ? "success" : "failure"}${
          result.error ? `. Error: ${result.error}` : ""
        }`;

        testResults.push({
          description: testCase.description,
          input: inputStr,
          result: "FAILED",
          message,
        });
        failed++;
      }
    } catch (error) {
      testResults.push({
        description: testCase.description,
        input: `name="${testCase.name}", year=${testCase.year}, area=${testCase.totalArea}`,
        result: "FAILED",
        message: `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      failed++;
    }
  }

  return { passed, failed, testResults };
}

export async function runFieldNameRetrievalTest(): Promise<TestResult> {
  try {
    const existingNames = await getExistingFieldNames();
    const uniqueNames = await getUniqueFieldNames();

    return {
      success: true,
      message: "Field name retrieval test passed",
      details: {
        existingFields: existingNames,
        uniqueNames: uniqueNames,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Field name retrieval test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function runDatabaseIndexTest(): Promise<TestResult> {
  try {
    // Set up indexes
    const setupResult = await setupFieldIndexes();

    if (!setupResult.success) {
      return {
        success: false,
        message: `Index setup failed: ${setupResult.error}`,
      };
    }

    // Get index information
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

    const indexStatus: Record<
      string,
      { present: string[]; missing: string[] }
    > = {};
    let allIndexesPresent = true;

    for (const [collection, expectedIndexes] of Object.entries(
      requiredIndexes
    )) {
      const collectionIndexes = indexInfo[collection] || [];
      const indexNames = collectionIndexes.map(
        (idx: { name: string }) => idx.name
      );

      const present = expectedIndexes.filter((idx) => indexNames.includes(idx));
      const missing = expectedIndexes.filter(
        (idx) => !indexNames.includes(idx)
      );

      indexStatus[collection] = { present, missing };

      if (missing.length > 0) {
        allIndexesPresent = false;
      }
    }

    return {
      success: allIndexesPresent,
      message: allIndexesPresent
        ? "All required indexes are present"
        : "Some required indexes are missing",
      details: indexStatus,
    };
  } catch (error) {
    return {
      success: false,
      message: `Database index test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function runAllFieldTests() {
  const fieldCreationResult = await runFieldCreationTests();
  const fieldRetrievalResult = await runFieldNameRetrievalTest();
  const databaseIndexResult = await runDatabaseIndexTest();

  const overallSuccess =
    fieldCreationResult.failed === 0 &&
    fieldRetrievalResult.success &&
    databaseIndexResult.success;

  return {
    fieldCreation: fieldCreationResult,
    fieldRetrieval: fieldRetrievalResult,
    databaseIndex: databaseIndexResult,
    overallSuccess,
    summary: {
      fieldCreationPassed: `${fieldCreationResult.passed}/${
        fieldCreationResult.passed + fieldCreationResult.failed
      }`,
      fieldRetrievalStatus: fieldRetrievalResult.success ? "PASSED" : "FAILED",
      databaseIndexStatus: databaseIndexResult.success ? "PASSED" : "FAILED",
    },
  };
}
