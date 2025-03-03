"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TractorWork } from "@/lib/type-definitions";
import DeleteWorkDialog from "./delete-work";
import Link from "next/link";
import { capitalizeFirstLetter, formatDatePattern } from "@/lib/utils";

interface TractorWorkTableProps {
  works: TractorWork[];
  // pagination: {
  //   total: number;
  //   pages: number;
  //   currentPage: number;
  // };
  tractorId: string;
}

export default function TractorWorkTable({
  works,
  // pagination,
  tractorId,
}: TractorWorkTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deleteWorkId, setDeleteWorkId] = useState<string | null>(null);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Category & Hours</TableHead>
            <TableHead>Work Details</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {works.map((work) => (
            <TableRow key={work.id}>
              <TableCell>{work.no}</TableCell>
              <TableCell>
                <Link
                  className="hover:underline"
                  href={`/accounting/tractor/${work.customerId}`}
                >
                  {work.customerName}
                </Link>
              </TableCell>
              <TableCell>
                {work.equipments.map((equipment, index) => (
                  <div key={index} className="flex gap-8 mb-2">
                    <span className="w-16">
                      {capitalizeFirstLetter(equipment.name)}
                    </span>{" "}
                    -<span>{equipment.hours} hours</span>
                  </div>
                ))}
              </TableCell>
              <TableCell>{work.detail ? work.detail : "N/A"}</TableCell>
              <TableCell>
                <span className="text-green-600">
                  {work.totalAmount.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>{formatDatePattern(work.date)}</TableCell>
              <TableCell className="space-x-1">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/tractor/${tractorId}/edit-work/${work.id}`}>
                    <Pen className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-100 "
                  onClick={() => setDeleteWorkId(work.id)}
                >
                  <Trash2 className=" h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {deleteWorkId && (
        <DeleteWorkDialog
          workId={deleteWorkId}
          tractorId={tractorId}
          isOpen={!!deleteWorkId}
          onClose={() => setDeleteWorkId(null)}
        />
      )}

      {/* <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
          (page) => (
            <Button
              key={page}
              variant={page === pagination.currentPage ? "default" : "outline"}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          )
        )}
      </div> */}
    </div>
  );
}
