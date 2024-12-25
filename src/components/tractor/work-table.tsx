"use client";

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

interface Equipment {
  name: string;
  hours: number;
  ratePerHour: number;
  amount: number;
}

interface TractorWork {
  id: string;
  customerId: string;
  tractorId: string;
  customerName: string;
  date: string;
  dieselExpense: number;
  driverName: string;
  equipments: Equipment[];
  totalAmount: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    totalDebit: number;
    totalPaid: number;
    createdAt: string;
  };
}

interface TractorWorkTableProps {
  tractorWorks: TractorWork[];
}

export default function TractorWorkTable({
  tractorWorks,
}: TractorWorkTableProps) {
  return (
    <div className="container mx-auto py-10">
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Category & Hours</TableHead>
            {/* <TableHead>Diesel</TableHead> */}
            <TableHead>Total Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tractorWorks.map((work) => (
            <TableRow key={work.id}>
              <TableCell>{work.customerName}</TableCell>
              <TableCell>
                {work.equipments.map((equipment, index) => (
                  <div key={index} className="flex gap-8 mb-2">
                    <span className="w-16">{equipment.name}</span> -
                    <span>{equipment.hours} hours</span>
                  </div>
                ))}
              </TableCell>
              {/* <TableCell>{work.dieselExpense}</TableCell> */}
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
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View details</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
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
    </div>
  );
}
