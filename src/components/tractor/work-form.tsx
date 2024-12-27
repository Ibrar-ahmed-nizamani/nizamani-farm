"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { EquipmentInput } from "./equipment-input";
import { submitTractorWork } from "@/lib/actions/work";
import { getAllCustomers } from "@/lib/actions/customer";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Define equipment rates
const EQUIPMENT_RATES = {
  cultivator: 2200,
  raja: 1800,
  gobal: 2000,
  laser: 2500,
  blade: 2300,
};

// Define the validation schema
const workFormSchema = z
  .object({
    customerName: z.string().min(1, "Customer name is required"),
    date: z.date({
      required_error: "Date is required",
    }),
    driverName: z.string().min(1, "Driver name is required"),
    cultivatorHours: z.number().min(0),
    rajaHours: z.number().min(0),
    gobalHours: z.number().min(0),
    laserHours: z.number().min(0),
    bladeHours: z.number().min(0),
  })
  .refine(
    (data) => {
      // At least one equipment must have hours > 0
      return (
        data.cultivatorHours > 0 ||
        data.rajaHours > 0 ||
        data.gobalHours > 0 ||
        data.laserHours > 0 ||
        data.bladeHours > 0
      );
    },
    {
      message: "At least one equipment must be added",
      path: ["cultivatorHours"], // This will show the error under cultivatorHours field
    }
  );

type WorkFormValues = z.infer<typeof workFormSchema>;

export function ExpenseForm({ tractorID }: { tractorID: string }) {
  const [customers, setCustomers] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Initialize the form
  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    defaultValues: {
      customerName: "",
      driverName: "",
      cultivatorHours: 0,
      rajaHours: 0,
      gobalHours: 0,
      laserHours: 0,
      bladeHours: 0,
    },
  });

  // Calculate amounts based on hours
  const calculateAmount = (hours: number, rate: number) => hours * rate;

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      const customersList = await getAllCustomers();
      setCustomers(customersList);
    };
    fetchCustomers();
  }, []);

  async function onSubmit(data: WorkFormValues) {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("tractorId", tractorID);
    formData.append("customerName", data.customerName);
    formData.append("date", format(data.date, "yyyy-MM-dd"));
    formData.append("driverName", data.driverName);

    // Add equipment data
    Object.entries(EQUIPMENT_RATES).forEach(([equipment, rate]) => {
      const hours = Number(data[`${equipment}Hours` as keyof WorkFormValues]);
      if (hours > 0) {
        formData.append(`${equipment}Hours`, hours.toString());
        formData.append(`${equipment}RatePerHour`, rate.toString());
        formData.append(
          `${equipment}Amount`,
          calculateAmount(hours, rate).toString()
        );
      }
    });

    try {
      const result = await submitTractorWork({}, formData);
      console.log(result);
      if (result?.success === false) {
        setError(result.message);
      } else {
        setSuccess("Work submitted successfully");
        form.reset();

        router.push(`/tractor/${tractorID}`);
      }
    } catch {
      setError("Failed to submit work");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c._id === value);
                    if (customer) {
                      field.onChange(customer.name);
                    }
                  }}
                >
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormControl>
                  <Input {...field} placeholder="Or type new customer name" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        " pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="driverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Driver Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-lg font-semibold">Equipments</div>

        {Object.entries(EQUIPMENT_RATES).map(([equipment, rate]) => (
          <FormField
            key={equipment}
            control={form.control}
            name={`${equipment}Hours` as keyof WorkFormValues}
            render={({ field }) => (
              <FormItem>
                <EquipmentInput
                  name={equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                  ratePerHour={rate}
                  hours={Number(field.value)}
                  amount={calculateAmount(Number(field.value), rate)}
                  onHoursChange={(hours) => field.onChange(hours)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="text-lg font-semibold">
          Total Amount:{" "}
          <span>
            {Object.entries(EQUIPMENT_RATES).reduce(
              (total, [equipment, rate]) =>
                total +
                calculateAmount(
                  Number(
                    form.getValues(`${equipment}Hours` as keyof WorkFormValues)
                  ),
                  rate
                ),
              0
            )}
          </span>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Work"}
        </Button>
      </form>
    </Form>
  );
}
