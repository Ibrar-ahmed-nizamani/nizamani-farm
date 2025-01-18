import AddTransactionForm from "@/components/milk/traders/trader-transaction-form";
import { Button } from "@/components/ui/button";
import { getMilkTrader } from "@/lib/actions/milk-trader";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ traderID: string }>;
}) {
  const id = (await params).traderID;
  const worker = await getMilkTrader(id);

  return (
    <section className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{worker.name}</h1>
        </div>
        <Button variant="link">
          <Link
            href={`/milk/workers/${id}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4 " /> Back to Worker
          </Link>
        </Button>
      </div>
      <h2 className="text-lg font-semibold">Add Worker Transaction</h2>
      <AddTransactionForm traderId={id} />
    </section>
  );
}
