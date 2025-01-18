import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardsProps {
  cards: {
    label: string;
    value: number;
    type: "income" | "expense" | "balance" | "due";
  }[];
}

export default function SummaryCards({ cards }: SummaryCardsProps) {
  const getTextColor = (type: string, value: number) => {
    if (type === "income") return "text-green-600";
    if (type === "expense") return "text-red-600";
    if (type === "due") return "text-black";
    // For balance type, color depends on value
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const formatValue = (type: string, value: number) => {
    if (type === "due") {
      const sign = value > 0 ? "Dr" : "Cr";
      return `Rs ${Math.abs(value).toFixed(0).toLocaleString()} ${sign}`;
    }
    return `Rs ${value.toFixed(0).toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <p className="font-medium text-lg">{card.label}</p>
            <h3
              className={`text-xl font-bold ${getTextColor(
                card.type,
                card.value
              )}`}
            >
              {formatValue(card.type, card.value)}
            </h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
