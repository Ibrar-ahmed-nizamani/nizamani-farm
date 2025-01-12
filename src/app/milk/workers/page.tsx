import AddWorkerForm from "@/components/milk/worker/add-worker-form";
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
import { getMilkWorkers } from "@/lib/actions/milk-worker";
import Link from "next/link";

export default async function WorkersPage() {
  const workers = await getMilkWorkers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Milk Workers</h1>
        <BackLink href="/milk" linkText="Back to Milk Page" />
      </div>

      <AddWorkerForm />
      {workers.length > 0 ? (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Num</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers?.map((worker, index) => (
              <TableRow key={worker._id}>
                <TableCell className="w-14">{index + 1}</TableCell>
                <TableCell>{worker.name}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/milk/workers/${worker._id}`}>
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
          title="No worker found"
          description="Start by adding your first worker"
        />
      )}
    </div>
  );
}
