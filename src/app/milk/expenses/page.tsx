import {
  getMilkExpenses,
  getMilkExpenseTypes,
  getMilkExpenseYearsAndMonths,
} from "@/lib/actions/milk-expense";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import EmptyState from "@/components/shared/empty-state";
import YearSelector from "@/components/milk/expenses/year-selector";
import MonthSelector from "@/components/milk/expenses/month-selector";
import MilkExpensesSummary from "@/components/milk/expenses/expenses-summary";
import MilkExpensesTable from "@/components/milk/expenses/expenses-table";
import BackLink from "@/components/ui/back-link";
import PrintMilkExpensesReport from "@/components/milk/expenses/milk-expense-report";
import { generateMilkExpensesSummary } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function MilkExpensesPage({ searchParams }: PageProps) {
  const year = (await searchParams).year;
  const month = (await searchParams).month;

  const expenseTypes = await getMilkExpenseTypes();
  const yearsAndMonths = await getMilkExpenseYearsAndMonths();
  const expenses = await getMilkExpenses(year, month);

  const summaryData = generateMilkExpensesSummary(expenses);

  const years = yearsAndMonths.map((yearsAndMonths) => yearsAndMonths.year);
  const availableMonths = year
    ? yearsAndMonths.find((ym) => ym.year.toString() === year)?.months || []
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Milk Expenses</h1>
        <BackLink href="/milk" linkText="Back to Milk Page" />
      </div>

      {expenses.length > 0 && <MilkExpensesSummary expenses={expenses} />}

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <YearSelector years={years} />
          {year && year !== "all" && (
            <MonthSelector availableMonths={availableMonths} />
          )}
        </div>
        <div className="flex gap-4 items-center">
          <PrintMilkExpensesReport
            expenses={expenses}
            year={year}
            month={month}
            summaryData={summaryData}
          />
          <Link href="/milk/expenses/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description="Start by adding your first milk expense"
          link="/milk/expenses/add"
          linkText="Add Expense"
        />
      ) : (
        <MilkExpensesTable expenses={expenses} expenseTypes={expenseTypes} />
      )}
    </div>
  );
}
