"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteMilkDialog from "./delete-milk-dialog";
import { formatDatePattern } from "@/lib/utils";
import { EditMilkRecord } from "./edit-milk-record";

interface MilkRecord {
  _id: string;
  date: Date;
  amMilk: number;
  pmMilk: number;
}

interface MilkTableProps {
  milkData: MilkRecord[];
}

export default function MilkTable({ milkData }: MilkTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMilkId, setSelectedMilkId] = useState<string>("");

  const handleDeleteClick = (milkId: string) => {
    setSelectedMilkId(milkId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>AM Milk (L)</TableHead>
              <TableHead>PM Milk (L)</TableHead>
              <TableHead>Total (L)</TableHead>
              <TableHead className="w-[100px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milkData.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{formatDatePattern(record.date)}</TableCell>
                <TableCell>{record.amMilk}</TableCell>
                <TableCell>{record.pmMilk}</TableCell>
                <TableCell className=" font-medium">
                  {(record.amMilk + record.pmMilk).toFixed(1)}
                </TableCell>
                <TableCell className="flex gap-3 items-center justify-center">
                  <EditMilkRecord
                    record={{
                      amMilk: record.amMilk,
                      pmMilk: record.pmMilk,
                      date: record.date.toISOString(),
                    }}
                    recordId={record._id}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    onClick={() => handleDeleteClick(record._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteMilkDialog
        milkId={selectedMilkId}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedMilkId("");
        }}
      />
    </>
  );
}
