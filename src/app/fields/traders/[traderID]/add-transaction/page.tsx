import AddTransactionForm from "@/components/fields/traders/trader-transaction-form";
import { Button } from "@/components/ui/button";
import { getFieldTrader } from "@/lib/actions/field-trader";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ traderID: string }>;
}) {
  const id = (await params).traderID;
  const trader = await getFieldTrader(id);

  return (
    <section className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{trader.name}</h1>
        </div>
        <Button variant="link">
          <Link
            href={`/fields/traders/${id}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4 " /> Back to Trader
          </Link>
        </Button>
      </div>
      <h2 className="text-lg font-semibold">Add Trader Transaction</h2>
      <AddTransactionForm traderId={id} />
    </section>
  );
}
