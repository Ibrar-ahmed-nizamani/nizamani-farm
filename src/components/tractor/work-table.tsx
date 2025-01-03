"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface TractorWorkTableProps {
  works: TractorWork[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
  tractorId: string;
}

export default function TractorWorkTable({
  works,
  pagination,
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
            <TableHead>Total Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                    <span className="w-16">{equipment.name}</span> -
                    <span>{equipment.hours} hours</span>
                  </div>
                ))}
              </TableCell>
              <TableCell>
                <span className="text-green-600">
                  {work.totalAmount.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                {new Date(work.date).toLocaleDateString("en-GB")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/tractor/${tractorId}/edit-work/${work.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Edit work</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteWorkId(work.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      <div className="flex justify-center gap-2 mt-4">
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
      </div>
    </div>
  );
}
