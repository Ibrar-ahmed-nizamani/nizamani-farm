import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EquipmentInputProps {
  name: string;
  ratePerHour: number;
  hours: number;
  amount: number;
  onHoursChange: (hours: number) => void;
}

export function EquipmentInput({
  name,
  ratePerHour,
  hours,
  amount,
  onHoursChange,
}: EquipmentInputProps) {
  return (
    <div className="flex justify-between items-center">
      <Label htmlFor={`${name.toLowerCase()}Hours`} className="w-[60px]">
        {name}
      </Label>
      <div>
        <Label htmlFor={`${name.toLowerCase()}RatePerHour`}>
          Rate per Hour
        </Label>
        <Input
          id={`${name.toLowerCase()}RatePerHour`}
          name={`${name.toLowerCase()}RatePerHour`}
          type="number"
          value={ratePerHour}
          readOnly
        />
      </div>
      <div>
        <Label htmlFor={`${name.toLowerCase()}Hours`}>Hours Worked</Label>
        <Input
          id={`${name.toLowerCase()}Hours`}
          name={`${name.toLowerCase()}Hours`}
          type="number"
          min="0"
          step="0.5"
          value={hours || ""}
          onChange={(e) => onHoursChange(+e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`${name.toLowerCase()}Amount`}>Amount</Label>
        <Input
          id={`${name.toLowerCase()}Amount`}
          name={`${name.toLowerCase()}Amount`}
          type="number"
          min="0"
          value={amount.toFixed(2)}
          required
          readOnly
        />
      </div>
    </div>
  );
}
