import { getFarmerConfigs } from "@/lib/newActions/farmerActions";
import { getExpenseCategories } from "@/lib/newActions/expenseCategoryActions";
import BackLink from "@/components/ui/back-link";
import EmptyState from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddFarmerConfigForm from "@/components/farmers/configuration/add-config-form";
import { DeleteFarmerConfig } from "@/components/farmers/configuration/delete-config";
import ExpenseCategoryManager from "@/components/farmers/configuration/expense-category-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";


export default async function FarmerConfigurationPage() {
  const configs = await getFarmerConfigs();
  const categories = await getExpenseCategories();
  console.log(configs);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Farmer Configurations</h1>
          <p className="text-muted-foreground text-lg">
            Manage expense share templates and categories
          </p>
        </div>
        <BackLink href={`/farmers`} linkText="Back to Farmers" />
      </div>

      <Tabs defaultValue="configs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="categories">Expense Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 border rounded-lg bg-card h-fit">
              <h2 className="text-xl font-semibold mb-4">Add New Configuration</h2>
              <p className="text-muted-foreground mb-4">
                Create a template for farmer expense shares (e.g., "50% Partner")
              </p>
              <AddFarmerConfigForm />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Existing Configurations</h2>
              {configs.length > 0 ? (
                <Table className="border">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Base Share</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config._id}>
                        <TableCell className="font-medium">
                            <Link href={`/farmers/configuration/${config._id}`} className="hover:underline text-primary">
                                {config.name}
                            </Link>
                        </TableCell>
                        <TableCell>{config.baseSharePercentage}%</TableCell>
                        <TableCell className="text-right">
                          <DeleteFarmerConfig id={config._id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  title="No configurations found"
                  description="Create your first configuration template"
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
            <ExpenseCategoryManager categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
