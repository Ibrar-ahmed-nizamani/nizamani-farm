import EmptyState from "@/components/shared/empty-state";
import CustomSearch from "@/components/shared/search";
import AddTractorEmployeeForm from "@/components/tractor/tractor-worker/add-tractor-worker";
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
import { getTractorEmployees } from "@/lib/actions/tractor-employee";
import Link from "next/link";

export default async function TractorWorkerPage() {
  const workers = await getTractorEmployees();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tractor Workers</h1>
        <BackLink href="/tractor" linkText="Back to Tractors Page" />
      </div>

      <AddTractorEmployeeForm />
      <CustomSearch
        data={workers}
        baseUrl="/tractor/tractor-workers"
        placeholder="Search worker..."
      />
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
                  <Link href={`/tractor/tractor-workers/${worker._id}`}>
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
