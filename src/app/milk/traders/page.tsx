// page.tsx (traders list page)
import AddTraderForm from "@/components/milk/traders/add-trader-form";
import EmptyState from "@/components/shared/empty-state";
import BackLink from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMilkTraders } from "@/lib/actions/milk-trader";
import Link from "next/link";

export default async function TradersPage() {
  const traders = await getMilkTraders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Milk Traders</h1>
        <BackLink href="/milk" linkText="Back to Milk Page" />
      </div>

      <AddTraderForm />
      {traders.length > 0 ? (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Num</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traders?.map((trader, index) => (
              <TableRow key={trader._id}>
                <TableCell className="w-14">{index + 1}</TableCell>
                <TableCell>{trader.name}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/milk/traders/${trader._id}`}>
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
          title="No trader found"
          description="Start by adding your first trader"
        />
      )}
    </div>
  );
}
