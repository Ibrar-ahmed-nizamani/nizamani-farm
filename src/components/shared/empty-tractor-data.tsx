import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { TractorIcon } from "lucide-react";

export default function EmptyTractorData({ title }: { title: string }) {
  return (
    <Card className="mt-12">
      <CardContent className="items-center flex flex-col justify-center py-10">
        <div className="flex items-center flex-col">
          <TractorIcon className="size-24 text-gray-500" />
          <p className="text-xl italic">No {title} yet?</p>
        </div>
        <CardDescription className="text-base">
          Add {title} and it will show up here.
        </CardDescription>
      </CardContent>
    </Card>
  );
}
