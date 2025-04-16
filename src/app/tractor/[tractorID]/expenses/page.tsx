import {
  getExpenseYears,
  getAllTractorExpenses,
} from "@/lib/actions/tractor-expense";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EmptyTractorData from "@/components/shared/empty-tractor-data";
import { getTractorDetails } from "@/lib/actions/tractor";
import ExpensesTable from "@/components/tractor/expenses-table";
import ExpenseYearSelector from "@/components/tractor/expense-year-selector";
import ExpenseReport from "@/components/tractor/expense-report";
import TractorName from "@/components/tractor/tractor-name";

export default async function TractorExpensesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tractorID: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const tractorID = (await params).tractorID;
  const selectedYear = (await searchParams).year || "all";

  const [expenses, availableYears, tractorDetails] = await Promise.all([
    getAllTractorExpenses(tractorID, { year: selectedYear }),
    getExpenseYears(tractorID),
    getTractorDetails(tractorID),
  ]);

  return (
    <section>
      <div className="flex justify-between items-start">
        <TractorName
          tractorName={tractorDetails.tractorName}
          tractorModel={tractorDetails.tractorModel}
        />
        <Button asChild variant="link">
          <Link href={`/tractor/${tractorID}`}>← Back to tractor</Link>
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Tractor Expenses</h3>
        <div className="flex items-center gap-4">
          <ExpenseYearSelector availableYears={availableYears} />
          <ExpenseReport
            tractorDetails={tractorDetails}
            tractorId={tractorID}
            year={selectedYear}
          />
          <Button asChild variant="destructive">
            <Link href={`/tractor/${tractorID}/expenses/add-expense`}>
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <EmptyTractorData title="expenses" />
      ) : (
        <ExpensesTable expenses={expenses} tractorId={tractorID} />
      )}
    </section>
  );
}
