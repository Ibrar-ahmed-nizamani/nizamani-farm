import { getMilkExpenseTypes } from "@/lib/actions/milk-expense";
import AddMilkExpenseForm from "@/components/milk/expenses/add-expense-form";
import AddExpenseTypeForm from "@/components/milk/expenses/add-expense-type-form";

export default async function AddMilkExpensePage() {
  const expenseTypes = await getMilkExpenseTypes();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Add Milk Expense</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Add New Expense</h2>
          <AddMilkExpenseForm expenseTypes={expenseTypes} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Add New Expense Type</h2>
          <AddExpenseTypeForm />
        </div>
      </div>
    </div>
  );
}
