"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  PlayCircle,
  CheckCircle,
  XCircle,
  Database,
  List,
  Plus,
} from "lucide-react";
import {
  runAllFieldTests,
  runFieldCreationTests,
  runFieldNameRetrievalTest,
  runDatabaseIndexTest,
} from "@/lib/actions/test-actions";

interface TestResults {
  fieldCreation: any;
  fieldRetrieval: any;
  databaseIndex: any;
  overallSuccess: boolean;
  summary: any;
}

export default function TestFieldsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    try {
      const results = await runAllFieldTests();
      setTestResults(results);
    } catch (error) {
      console.error("Test execution failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualTest = async (testType: string) => {
    setActiveTest(testType);
    try {
      let result;
      switch (testType) {
        case "creation":
          result = await runFieldCreationTests();
          break;
        case "retrieval":
          result = await runFieldNameRetrievalTest();
          break;
        case "database":
          result = await runDatabaseIndexTest();
          break;
      }
      console.log(`${testType} test result:`, result);
    } catch (error) {
      console.error(`${testType} test failed:`, error);
    } finally {
      setActiveTest(null);
    }
  };

  const StatusIcon = ({ success }: { success: boolean }) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Field Management System Tests
        </h1>
        <p className="text-muted-foreground">
          Test your field implementation functionality, database indexes, and
          data validation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Run Tests
            </CardTitle>
            <CardDescription>Execute field management tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Run All Tests"
              )}
            </Button>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => runIndividualTest("creation")}
                disabled={activeTest === "creation"}
                className="w-full"
              >
                {activeTest === "creation" ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-3 w-3" />
                )}
                Field Creation Test
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => runIndividualTest("retrieval")}
                disabled={activeTest === "retrieval"}
                className="w-full"
              >
                {activeTest === "retrieval" ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <List className="mr-2 h-3 w-3" />
                )}
                Field Retrieval Test
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => runIndividualTest("database")}
                disabled={activeTest === "database"}
                className="w-full"
              >
                {activeTest === "database" ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Database className="mr-2 h-3 w-3" />
                )}
                Database Index Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Summary */}
        {testResults && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon success={testResults.overallSuccess} />
                  Overall Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Field Creation:</span>
                    <Badge
                      variant={
                        testResults.fieldCreation.failed === 0
                          ? "default"
                          : "destructive"
                      }
                    >
                      {testResults.summary.fieldCreationPassed}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Field Retrieval:</span>
                    <Badge
                      variant={
                        testResults.fieldRetrieval.success
                          ? "default"
                          : "destructive"
                      }
                    >
                      {testResults.summary.fieldRetrievalStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database Indexes:</span>
                    <Badge
                      variant={
                        testResults.databaseIndex.success
                          ? "default"
                          : "destructive"
                      }
                    >
                      {testResults.summary.databaseIndexStatus}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg border">
                  <p
                    className={`font-medium ${
                      testResults.overallSuccess
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {testResults.overallSuccess
                      ? "🎉 All tests passed! Your field implementation is ready for production."
                      : "⚠️ Some tests failed. Please review the results below."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Total Tests:</strong>{" "}
                    {testResults.fieldCreation.passed +
                      testResults.fieldCreation.failed +
                      2}
                  </p>
                  <p>
                    <strong>Passed:</strong>{" "}
                    {testResults.fieldCreation.passed +
                      (testResults.fieldRetrieval.success ? 1 : 0) +
                      (testResults.databaseIndex.success ? 1 : 0)}
                  </p>
                  <p>
                    <strong>Failed:</strong>{" "}
                    {testResults.fieldCreation.failed +
                      (testResults.fieldRetrieval.success ? 0 : 1) +
                      (testResults.databaseIndex.success ? 0 : 1)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Detailed Results */}
      {testResults && (
        <div className="space-y-6">
          {/* Field Creation Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon success={testResults.fieldCreation.failed === 0} />
                Field Creation Tests
              </CardTitle>
              <CardDescription>
                Testing field validation, duplicate prevention, and data
                sanitization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.fieldCreation.testResults.map(
                  (test: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{test.description}</h4>
                        <Badge
                          variant={
                            test.result === "PASSED" ? "default" : "destructive"
                          }
                        >
                          {test.result}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Input: {test.input}
                      </p>
                      <p className="text-sm">{test.message}</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Field Retrieval Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon success={testResults.fieldRetrieval.success} />
                Field Retrieval Test
              </CardTitle>
              <CardDescription>
                Testing field name retrieval functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium">
                  {testResults.fieldRetrieval.message}
                </p>
                {testResults.fieldRetrieval.details && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h5 className="font-medium mb-2">Existing Fields:</h5>
                      <div className="text-sm space-y-1">
                        {testResults.fieldRetrieval.details.existingFields
                          .length > 0 ? (
                          testResults.fieldRetrieval.details.existingFields.map(
                            (field: string, i: number) => (
                              <div
                                key={i}
                                className="px-2 py-1 bg-muted rounded"
                              >
                                {field}
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-muted-foreground">
                            No existing fields found
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Unique Names:</h5>
                      <div className="text-sm space-y-1">
                        {testResults.fieldRetrieval.details.uniqueNames.length >
                        0 ? (
                          testResults.fieldRetrieval.details.uniqueNames.map(
                            (name: string, i: number) => (
                              <div
                                key={i}
                                className="px-2 py-1 bg-muted rounded"
                              >
                                {name}
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-muted-foreground">
                            No unique names found
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Database Index Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon success={testResults.databaseIndex.success} />
                Database Index Test
              </CardTitle>
              <CardDescription>
                Testing database index setup and performance optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium">
                  {testResults.databaseIndex.message}
                </p>
                {testResults.databaseIndex.details && (
                  <div className="space-y-4">
                    {Object.entries(testResults.databaseIndex.details).map(
                      ([collection, status]: [string, any]) => (
                        <div key={collection} className="border rounded-lg p-3">
                          <h5 className="font-medium mb-2">{collection}</h5>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="text-sm font-medium text-green-600 mb-1">
                                Present Indexes:
                              </p>
                              {status.present.length > 0 ? (
                                status.present.map((idx: string, i: number) => (
                                  <div
                                    key={i}
                                    className="text-sm px-2 py-1 bg-green-50 rounded mb-1"
                                  >
                                    ✅ {idx}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  None
                                </p>
                              )}
                            </div>
                            {status.missing.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-red-600 mb-1">
                                  Missing Indexes:
                                </p>
                                {status.missing.map(
                                  (idx: string, i: number) => (
                                    <div
                                      key={i}
                                      className="text-sm px-2 py-1 bg-red-50 rounded mb-1"
                                    >
                                      ❌ {idx}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
