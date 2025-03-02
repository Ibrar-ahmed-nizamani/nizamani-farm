// app/fields/page.tsx
import EmptyState from "@/components/shared/empty-state";
import CustomSearch from "@/components/shared/search";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFields } from "@/lib/actions/field";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default async function FieldsPage() {
  const fields = await getFields();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fields</h1>
        <Link href="/fields/add">
          <Button>
            <PlusIcon className="size-4" /> Add Field
          </Button>
        </Link>
      </div>

      <CustomSearch
        data={fields}
        baseUrl="/fields"
        placeholder="Search fields..."
      />

      {fields.length > 0 ? (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {/* <TableHead>Location</TableHead> */}
              <TableHead>Total Area (Acres)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields?.map((field) => (
              <TableRow key={field._id}>
                <TableCell>{field.name}</TableCell>
                {/* <TableCell>{field.location}</TableCell> */}
                <TableCell>{field.totalArea}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/fields/${field._id}`}>
                    <Button variant="outline" size="lg">
                      View Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No fields found"
          description="Start by adding your first field"
        />
      )}
    </div>
  );
}
