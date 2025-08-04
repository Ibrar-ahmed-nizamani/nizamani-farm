import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TestTube, Database, Plus, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Nizamani Farm Management</h1>
        <p className="text-muted-foreground">
          Comprehensive farm and field management system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Field Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Field Management
            </CardTitle>
            <CardDescription>
              Create and manage your agricultural fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/fields">
                <Button variant="outline" className="w-full">
                  View Fields
                </Button>
              </Link>
              <Link href="/fields/add">
                <Button variant="outline" className="w-full">
                  Add New Field
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Test Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              System Tests
            </CardTitle>
            <CardDescription>
              Test field functionality and database performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/test-fields">
              <Button className="w-full">Run Field Tests</Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              Test validation, database indexes, and field operations
            </p>
          </CardContent>
        </Card>

        {/* Database Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Tools
            </CardTitle>
            <CardDescription>
              Monitor and optimize database performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" disabled>
                View Index Status
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Performance Metrics
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available in test interface
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Quick Start
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">For Development</h3>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Run field tests to verify setup</li>
              <li>2. Create your first field</li>
              <li>3. Add farmers and allocations</li>
              <li>4. Start recording transactions</li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium mb-2">For Production</h3>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Ensure all tests pass</li>
              <li>2. Set up database indexes</li>
              <li>3. Configure backup strategy</li>
              <li>4. Monitor performance regularly</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
