import { getFarmerConfig } from "@/lib/newActions/farmerActions";
import { getExpenseCategories } from "@/lib/newActions/expenseCategoryActions";
import BackLink from "@/components/ui/back-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/shared/empty-state";
import AddConfigExpenseForm from "@/components/farmers/configuration/add-config-expense-form";
import { DeleteConfigExpense } from "@/components/farmers/configuration/delete-config-expense";

export default async function FarmerConfigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await getFarmerConfig(id);
  const categories = await getExpenseCategories();

  if (!config) {
    return <div>Configuration not found</div>;
  }

  // Filter out categories that are already assigned to this config
  const availableCategories = categories.filter(cat => 
    !config.expenseConfigs.some(ec => ec.categoryId === cat._id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{config.name}</h1>
          <p className="text-muted-foreground text-lg">
            Base Share: {config.baseSharePercentage}%
          </p>
        </div>
        <BackLink href={`/farmers/configuration`} linkText="Back to Configurations" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg bg-card h-fit">
            <h2 className="text-xl font-semibold mb-4">Add Expense Override</h2>
            <p className="text-muted-foreground mb-4">
                Assign specific share percentage for an expense category.
            </p>
            <AddConfigExpenseForm configId={config._id} categories={availableCategories} />
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned Expenses</h2>
            {config.expenseConfigs.length > 0 ? (
                <Table className="border">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Farmer Share</TableHead>
                            <TableHead>Owner Share</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {config.expenseConfigs.map((ec) => (
                            <TableRow key={ec.categoryId}>
                                <TableCell>{ec.category} - {ec.itemName}</TableCell>
                                <TableCell>{ec.farmerShare}%</TableCell>
                                <TableCell>{ec.ownerShare}%</TableCell>
                                <TableCell className="text-right">
                                    <DeleteConfigExpense configId={config._id} categoryId={ec.categoryId} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyState
                    title="No overrides defined"
                    description="All expenses follow the base share percentage."
                />
            )}
        </div>
      </div>
    </div>
  );
}
