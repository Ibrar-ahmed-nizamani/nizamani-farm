import { getFarmerConfig } from "@/lib/newActions/farmerActions";
import { getExpenseCategories } from "@/lib/newActions/expenseCategoryActions";
import BackLink from "@/components/ui/back-link";
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

  // Get unique category groups that still have available items
  const availableCategoryGroups = [...new Set(availableCategories.map(c => c.category))];

  // Group assigned expenses by category
  const groupedExpenses = config.expenseConfigs.reduce((acc, ec) => {
    const group = ec.category;
    if (!acc[group]) acc[group] = [];
    acc[group].push(ec);
    return acc;
  }, {} as Record<string, typeof config.expenseConfigs>);

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
            <AddConfigExpenseForm 
              configId={config._id} 
              categories={availableCategories}
              categoryGroups={availableCategoryGroups}
            />
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned Expenses</h2>
            {config.expenseConfigs.length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(groupedExpenses).map(([categoryName, items]) => (
                        <div key={categoryName} className="border rounded-lg overflow-hidden">
                            {/* Category Header */}
                            <div className="bg-muted/50 px-4 py-3 border-b">
                                <h3 className="font-bold text-lg">{categoryName}</h3>
                            </div>
                            {/* Items in this category */}
                            <div className="divide-y">
                                {items.map((ec) => (
                                    <div 
                                        key={ec.categoryId} 
                                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
                                    >
                                        <div className="flex-1">
                                            <span className="text-muted-foreground">{ec.itemName}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Farmer:</span>{" "}
                                                <span className="font-medium">{ec.farmerShare}%</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Owner:</span>{" "}
                                                <span className="font-medium">{ec.ownerShare}%</span>
                                            </div>
                                            <DeleteConfigExpense configId={config._id} categoryId={ec.categoryId} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
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
