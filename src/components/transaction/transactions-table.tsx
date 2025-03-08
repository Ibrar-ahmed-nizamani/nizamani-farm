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
import { EditTransaction } from "./edit-tractor-customer-transaction";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  type: "CREDIT" | "DEBIT";
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
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Credit</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead className="text-center w-20">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell>{formatDatePattern(transaction.date)}</TableCell>
              <TableCell>{transaction.description || "N/A"}</TableCell>
              <TableCell className="text-green-600">
                {transaction.type === "CREDIT" &&
                  `Rs ${transaction.amount.toLocaleString()}`}
              </TableCell>
              <TableCell className="text-red-600">
                {transaction.type === "DEBIT" &&
                  `Rs ${transaction.amount.toLocaleString()}`}
              </TableCell>
              <TableCell className="flex space-x-1 items-center justify-center">
                <EditTransaction
                  transactionId={transaction._id}
                  customerId={customerId}
                  transaction={transaction}
                />
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
