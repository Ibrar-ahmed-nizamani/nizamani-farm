"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
// import { submitTractorWork } from "@/lib/actions";
import { EquipmentInput } from "./equipment-input";
import { submitTractorWork } from "@/lib/actions/work";
import { getAllCustomers } from "@/lib/actions/customer";

export function ExpenseForm({ tractorID }: { tractorID: string }) {
  const [date, setDate] = useState<Date>();
  console.log(tractorID);
  const [state, formAction, pending] = useActionState(submitTractorWork, {
    success: false,
    message: "",
  });
  console.log(state);
  // Separate state for each equipment type
  const [cultivatorHours, setCultivatorHours] = useState<number>(0);
  const [rajaHours, setRajaHours] = useState<number>(0);
  const [gobalHours, setGobalHours] = useState<number>(0);
  const [laserHours, setLaserHours] = useState<number>(0);
  const [bladeHours, setBladeHours] = useState<number>(0);

  const [cultivatorAmount, setCultivatorAmount] = useState<number>(0);
  const [rajaAmount, setRajaAmount] = useState<number>(0);
  const [gobalAmount, setGobalAmount] = useState<number>(0);
  const [laserAmount, setLaserAmount] = useState<number>(0);
  const [bladeAmount, setBladeAmount] = useState<number>(0);

  const [customers, setCustomers] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  // Define rates for each equipment type
  const EQUIPMENT_RATES = {
    cultivator: 2200,
    raja: 1800,
    gobal: 2000,
    laser: 2500,
    blade: 2300,
  };

  // Separate useEffect for each equipment type
  useEffect(() => {
    setCultivatorAmount(
      cultivatorHours >= 0 ? cultivatorHours * EQUIPMENT_RATES.cultivator : 0
    );
  }, [cultivatorHours]);

  useEffect(() => {
    setRajaAmount(rajaHours >= 0 ? rajaHours * EQUIPMENT_RATES.raja : 0);
  }, [rajaHours]);

  useEffect(() => {
    setGobalAmount(gobalHours >= 0 ? gobalHours * EQUIPMENT_RATES.gobal : 0);
  }, [gobalHours]);

  useEffect(() => {
    setLaserAmount(laserHours >= 0 ? laserHours * EQUIPMENT_RATES.laser : 0);
  }, [laserHours]);

  useEffect(() => {
    setBladeAmount(bladeHours >= 0 ? bladeHours * EQUIPMENT_RATES.blade : 0);
  }, [bladeHours]);

  useEffect(() => {
    if (state.success) {
      setBladeAmount(0);
      setCultivatorAmount(0);
      setRajaAmount(0);
      setLaserAmount(0);
      setGobalAmount(0);
    }
  }, [state.success]);

  // Add this useEffect to fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      const customersList = await getAllCustomers();
      console.log(customersList);
      setCustomers(
        customersList.map((customer) => ({
          _id: customer._id.toString(),
          name: customer.name,
        }))
      );
    };
    fetchCustomers();
  }, []);

  return (
    <form action={formAction} className="space-y-3  mt-7 ">
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <div className="flex gap-2">
          <Select
            onValueChange={(value) => {
              const customer = customers.find((c) => c._id === value);
              if (customer) {
                const input = document.getElementById(
                  "customerName"
                ) as HTMLInputElement;
                input.value = customer.name;
                setSelectedCustomer(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select existing customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer._id} value={customer._id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="customerName"
            name="customerName"
            required
            placeholder="Or type new customer name"
          />
        </div>
      </div>
      <Input id="tractorId" name="tractorId" type="hidden" value={tractorID} />

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full justify-start text-left font-normal ${
                !date && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              required
            />
          </PopoverContent>
        </Popover>
        <Input
          id="date"
          name="date"
          type="hidden"
          value={date ? format(date, "yyyy-MM-dd") : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="driverName">Driver Name</Label>
        <Input id="driverName" name="driverName" required />
      </div>

      <div className="text-lg">Equipments</div>

      <EquipmentInput
        name="Cultivator"
        ratePerHour={EQUIPMENT_RATES.cultivator}
        hours={cultivatorHours}
        amount={cultivatorAmount}
        onHoursChange={setCultivatorHours}
      />

      <EquipmentInput
        name="Raja"
        ratePerHour={EQUIPMENT_RATES.raja}
        hours={rajaHours}
        amount={rajaAmount}
        onHoursChange={setRajaHours}
      />

      <EquipmentInput
        name="Gobal"
        ratePerHour={EQUIPMENT_RATES.gobal}
        hours={gobalHours}
        amount={gobalAmount}
        onHoursChange={setGobalHours}
      />

      <EquipmentInput
        name="Laser"
        ratePerHour={EQUIPMENT_RATES.laser}
        hours={laserHours}
        amount={laserAmount}
        onHoursChange={setLaserHours}
      />

      <EquipmentInput
        name="Blade"
        ratePerHour={EQUIPMENT_RATES.blade}
        hours={bladeHours}
        amount={bladeAmount}
        onHoursChange={setBladeHours}
      />

      <div>
        Total Amount:{" "}
        <strong>
          {bladeAmount +
            laserAmount +
            cultivatorAmount +
            gobalAmount +
            rajaAmount}
        </strong>
      </div>

      <Button disabled={pending} className="w-full">
        Submit Work
      </Button>

      {state.success && <p className="text-green-600">{state.message}</p>}
      {state.success === false ? (
        <p className="text-red-600">{state.message}</p>
      ) : (
        ""
      )}
    </form>
  );
}
