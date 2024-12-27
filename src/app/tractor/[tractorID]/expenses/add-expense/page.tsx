import AddExpenseForm from "@/components/tractor/add-expense-form";

export default async function AddExpensePage({
  params,
}: {
  params: Promise<{ tractorID: string }>;
}) {
  const tractorID = (await params).tractorID;
  console.log(tractorID);
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Tractor Expense</h1>
      <AddExpenseForm tractorId={tractorID} />
    </div>
  );
}
