import { CardDescription } from "../ui/card";

export default function TractorName({
  tractorName,
  tractorModel,
}: {
  tractorName: string;
  tractorModel: number;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-xl font-semibold">{tractorName}</h2>
      
      <CardDescription className="text-base">{tractorModel}</CardDescription>
    </div>
  );
}
