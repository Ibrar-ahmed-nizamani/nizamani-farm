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
import {
  getFields,
  getFieldSummaryForList,
  getRemainingArea,
} from "@/lib/actions/field";
import { PlusIcon, Settings } from "lucide-react";
import Link from "next/link";
import EditFieldDialog from "@/components/fields/edit-field-dialog";

export default async function FieldsPage() {
  const fields = await getFields();

  // Get summary for each field
  const fieldsWithSummary = await Promise.all(
    fields.map(async (field) => {
      const summary = await getFieldSummaryForList(field._id);
      const { remainingArea } = await getRemainingArea(field._id);
      return {
        ...field,
        farmerCount: summary.farmerCount,
        totalExpenses: summary.totalExpenses,
        totalIncome: summary.totalIncome,
        balance: summary.balance,
        remainingArea: remainingArea || 0,
      };
    })
  );
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fields</h1>
        <div className="flex space-x-4 items-center">
          <Link href={`/fields/traders`}>
            <Button variant="outline">Traders</Button>
          </Link>
          <Link href={`/fields/share-setting`}>
            <Button variant="outline">
              <Settings className="size-4" /> Share Settings
            </Button>
          </Link>
          <Link href="/fields/add">
            <Button>
              <PlusIcon className="size-4" /> Add Field
            </Button>
          </Link>
        </div>
      </div>

      <CustomSearch
        data={fields}
        baseUrl="/fields"
        placeholder="Search fields..."
      />

      {fieldsWithSummary.length > 0 ? (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Total Area (Acres)</TableHead>
              <TableHead>Farmers</TableHead>
              <TableHead>Total Expenses</TableHead>
              <TableHead>Total Income</TableHead>
              <TableHead>Net Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fieldsWithSummary?.map((field) => (
              <TableRow key={field._id}>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.totalArea} acres</TableCell>
                <TableCell>{field.farmerCount}</TableCell>
                <TableCell className="bg-red-500/10 font-medium">
                  Rs. {(field.totalExpenses || 0).toLocaleString()}
                </TableCell>
                <TableCell className="bg-green-500/10 font-medium">
                  Rs. {(field.totalIncome || 0).toLocaleString()}
                </TableCell>
                <TableCell
                  className={`font-medium ${
                    (field.balance || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Rs. {(field.balance || 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <EditFieldDialog
                      fieldId={field._id}
                      fieldName={field.name}
                      totalArea={field.totalArea}
                      remainingArea={field.remainingArea}
                    />
                    <Link href={`/fields/${field._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8  text-[16px]"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
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
