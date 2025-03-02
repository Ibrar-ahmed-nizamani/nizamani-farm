// app/fields/[fieldId]/page.tsx

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import EmptyState from "@/components/shared/empty-state";
import BackLink from "@/components/ui/back-link";
import { getField, getFieldFarmers } from "@/lib/actions/field";
import AddFarmerForm from "@/components/fields/add-farmer";
import { PlusIcon, Settings } from "lucide-react";

export default async function FieldPage({
  params,
}: {
  params: Promise<{ fieldId: string }>;
}) {
  const fieldId = (await params).fieldId;

  const field = await getField(fieldId);
  const farmers = await getFieldFarmers(fieldId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{field.name}</h1>
          <p className="text-muted-foreground">
            Total Area: {field.totalArea} acres
          </p>
        </div>
        <BackLink href="/fields" linkText="Back to Fields" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Farmers</h2>
          <div className="flex space-x-4">
            <Link href={`/fields/${field._id}/share-setting`}>
              <Button variant="outline">
                <Settings className="size-4" /> Share Settings
              </Button>
            </Link>
            <Link href={`/fields/${field._id}/add-farmer`}>
              <Button>
                <PlusIcon className="size-4" /> Add Farmer
              </Button>
            </Link>
          </div>
        </div>

        {farmers.length > 0 ? (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Share Type</TableHead>
                <TableHead>Allocated Area</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer._id}>
                  <TableCell>{farmer.name}</TableCell>
                  <TableCell>
                    {farmer.shareType === "HALF" ? "1/2" : "1/4"}
                  </TableCell>
                  <TableCell>{farmer.allocatedArea} acres</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/fields/${field._id}/farmers/${farmer._id}`}>
                      <Button variant="outline">View Transactions</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No farmers assigned"
            description="Start by adding farmers to this field"
          />
        )}
      </div>
    </div>
  );
}
