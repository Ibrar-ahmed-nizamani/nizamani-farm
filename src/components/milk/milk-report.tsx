"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface MilkRecord {
  _id: string;
  date: string;
  amMilk: number;
  pmMilk: number;
}

interface MilkReportProps {
  milkData: MilkRecord[];
  year?: string;
  month?: string;
}

export default function MilkReport({ milkData, year, month }: MilkReportProps) {
  // Calculate totals
  const totalAmMilk = milkData.reduce((sum, record) => sum + record.amMilk, 0);
  const totalPmMilk = milkData.reduce((sum, record) => sum + record.pmMilk, 0);
  const totalMilk = totalAmMilk + totalPmMilk;

  const getReportTitle = () => {
    if (year && month) {
      const monthName = new Date(`${year}-${month}-01`).toLocaleString(
        "default",
        { month: "long" }
      );
      return `Milk Report - ${monthName} ${year}`;
    }
    if (year) {
      return `Milk Report - Year ${year}`;
    }
    return "Milk Report - All Time";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="no-print">
        <Button onClick={handlePrint} className="mb-4">
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div className="print-content">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Farm Management</h1>
            <h2 className="text-xl mt-2">{getReportTitle()}</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Total AM Milk</div>
              <div className="text-lg font-medium">
                {totalAmMilk.toFixed(1)} L
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total PM Milk</div>
              <div className="text-lg font-medium">
                {totalPmMilk.toFixed(1)} L
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Milk</div>
              <div className="text-lg font-medium">
                {totalMilk.toFixed(1)} L
              </div>
            </div>
          </div>

          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-right">AM Milk (L)</th>
                <th className="border p-2 text-right">PM Milk (L)</th>
                <th className="border p-2 text-right">Total (L)</th>
              </tr>
            </thead>
            <tbody>
              {milkData.map((record) => (
                <tr key={record._id}>
                  <td className="border p-2">
                    {new Date(record.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="border p-2 text-right">{record.amMilk}</td>
                  <td className="border p-2 text-right">{record.pmMilk}</td>
                  <td className="border p-2 text-right font-medium">
                    {(record.amMilk + record.pmMilk).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted font-medium">
                <td className="border p-2">Total</td>
                <td className="border p-2 text-right">
                  {totalAmMilk.toFixed(1)}
                </td>
                <td className="border p-2 text-right">
                  {totalPmMilk.toFixed(1)}
                </td>
                <td className="border p-2 text-right">
                  {totalMilk.toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="text-sm text-muted-foreground mt-4 text-center">
            Generated on {new Date().toLocaleDateString("en-GB")}
          </div>
        </div>
      </div>
    </div>
  );
}
