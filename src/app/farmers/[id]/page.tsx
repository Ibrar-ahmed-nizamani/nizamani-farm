import { getFarmer } from "@/lib/newActions/farmerActions";
import BackLink from "@/components/ui/back-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Phone, CreditCard, Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default async function FarmerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const farmer = await getFarmer(id);

  if (!farmer) {
    return <div>Farmer not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={farmer.imageUrl} alt={farmer.name} />
            <AvatarFallback className="text-2xl">
              {farmer.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{farmer.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              {farmer.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{farmer.phone}</span>
                </div>
              )}
              {farmer.cnic && (
                <>
                  <span>•</span>
                  <span>CNIC: {farmer.cnic}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <BackLink href="/farmers" linkText="Back to List" />
      </div>

      <Separator />

      {/* Summary Cards (On-Demand Aggregation) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {farmer.summary.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings from all crops
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {farmer.summary.totalExpense.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime expenses from all crops
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${farmer.summary.currentBalance >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {farmer.summary.currentBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current outstanding balance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Crops ({farmer.workingFields.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived Crops ({farmer.archivedFields.length})</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Crops</CardTitle>
            </CardHeader>
            <CardContent>
                {farmer.workingFields.length === 0 ? (
                    <p className="text-muted-foreground">No active crops assigned.</p>
                ) : (
                    <div className="space-y-2">
                        {/* TODO: Fetch and display actual crop details here */}
                        <p>List of active crops will go here (Requires Crop Actions)</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived" className="mt-4">
            <Card>
            <CardHeader>
              <CardTitle>Archived Crops</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No archived crops.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
            <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Full transaction history will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
