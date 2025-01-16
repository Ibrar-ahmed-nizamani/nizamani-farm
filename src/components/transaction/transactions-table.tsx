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
import DeleteTransactionDialog from "./delete-transaction";
import { formatDatePattern } from "@/lib/utils";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  customerId: string;
}

export default function TransactionsTable({
  transactions,
  customerId,
}: TransactionsTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");

  const handleDeleteClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>Payment</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions
            .filter((transaction) => transaction.type === "CREDIT")
            .map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>Rs {transaction.amount.toLocaleString()}</TableCell>
                <TableCell>{transaction.description || "N/A"}</TableCell>
                <TableCell>{formatDatePattern(transaction.date)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    onClick={() => handleDeleteClick(transaction._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <DeleteTransactionDialog
        transactionId={selectedTransactionId}
        customerId={customerId}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTransactionId("");
        }}
      />
    </>
  );
}
