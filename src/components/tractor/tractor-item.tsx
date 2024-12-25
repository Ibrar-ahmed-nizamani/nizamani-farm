import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TractorIcon } from "lucide-react";

export function TractorItem({
  name,
  model,
  id,
}: {
  name: string;
  model: string;
  id: string;
}) {
  return (
    <Link href={`/tractor/${id}`}>
      <Card className="hover:shadow-md transition-shadow my-3">
        <CardContent className="p-3">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <TractorIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold ">{name}</h3>
              <p className=" text-muted-foreground">{model}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
