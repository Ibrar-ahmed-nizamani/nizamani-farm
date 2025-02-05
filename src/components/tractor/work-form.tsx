"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { submitTractorWork, editTractorWork } from "@/lib/actions/work";
import { getAllCustomers } from "@/lib/actions/customer";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Equipment {
  _id: string;
  name: string;
  rate: number;
}

interface ValuesType {
  customerName: string;
  date: Date;
  detail: string;
  driverName: string;
  [key: `${string}Hours`]: number;
}

interface DefaultValues {
  customerName: string;
  detail: string;
  driverName: string;
  [key: string]: string | number;
}
// Dynamic schema creation based on equipment
const createWorkFormSchema = (equipmentRates: Equipment[]) => {
  const baseSchema = {
    customerName: z.string().min(1, "Customer name is required"),
    date: z.date({
      required_error: "Date is required",
    }),
    detail: z.string().min(1, "Detail is required"),
    driverName: z.string().min(1, "Driver name is required"),
  };

  const equipmentFields: { [key: string]: z.ZodNumber } = {};
  equipmentRates.forEach((equipment) => {
    equipmentFields[`${equipment.name.toLowerCase()}Hours`] = z.number().min(0);
  });

  return z
    .object({
      ...baseSchema,
      ...equipmentFields,
    })
    .refine(
      (data) => {
        return Object.keys(data).some((key) => {
          if (key.endsWith("Hours")) {
            const value = data[key as keyof typeof data];
            return typeof value === "number" && value > 0;
          }
          return false;
        });
      },
      {
        message: "At least one equipment must be added",
        path: ["cultivatorHours"],
      }
    );
};

interface WorkFormData {
  id: string;
  customerName: string;
  date: string;
  detail: string;
  driverName: string;
  equipments: {
    name: string;
    hours: number;
    ratePerHour: number;
    amount: number;
  }[];
}

interface AddTractorWorkFormProps {
  tractorID: string;
  equipmentRates: Equipment[];
  initialData?: WorkFormData;
  isEditing?: boolean;
}

export function AddTractorWorkForm({
  equipmentRates,
  tractorID,
  initialData,
  isEditing,
}: AddTractorWorkFormProps) {
  const [customers, setCustomers] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Create dynamic default values
  const createDefaultValues = () => {
    if (initialData) {
      const values: ValuesType = {
        customerName: initialData.customerName,
        date: new Date(initialData.date),
        detail: initialData.detail,
        driverName: initialData.driverName,
      };

      equipmentRates.forEach((equipment) => {
        console.log(initialData.equipments);
        const equipmentData = initialData.equipments.find(
          (e) => e.name === equipment.name
        );
        values[`${equipment.name.toLowerCase()}Hours`] =
          equipmentData?.hours || 0;
      });

      return values;
    }

    const defaultValues: DefaultValues = {
      customerName: "",
      detail: "",
      driverName: "",
    };

    equipmentRates.forEach((equipment) => {
      defaultValues[`${equipment.name.toLowerCase()}Hours`] = 0;
    });

    return defaultValues;
  };

  const workFormSchema = createWorkFormSchema(equipmentRates);
  type WorkFormValues = z.infer<typeof workFormSchema>;

  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    defaultValues: createDefaultValues(),
  });

  const calculateAmount = (hours: number, rate: number) => hours * rate;

  // Watch all equipment hours fields
  const watchFields = useWatch<WorkFormValues>({
    control: form.control,
    name: equipmentRates.map(
      (equipment) =>
        `${equipment.name.toLowerCase()}Hours` as keyof WorkFormValues
    ),
  });

  const totalAmount = equipmentRates.reduce(
    (total, equipment, index) =>
      total + calculateAmount(Number(watchFields[index]), equipment.rate),
    0
  );

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
    formData.append("detail", data.detail);
    formData.append("driverName", data.driverName);

    equipmentRates.forEach((equipment) => {
      const hours = Number(
        data[`${equipment.name.toLowerCase()}Hours` as keyof WorkFormValues]
      );
      if (hours > 0) {
        formData.append(
          `${equipment.name.toLowerCase()}Hours`,
          hours.toString()
        );
        formData.append(
          `${equipment.name.toLowerCase()}RatePerHour`,
          equipment.rate.toString()
        );
        formData.append(
          `${equipment.name.toLowerCase()}Amount`,
          calculateAmount(hours, equipment.rate).toString()
        );
      }
    });

    try {
      let result;
      if (isEditing && initialData?.id) {
        result = await editTractorWork(initialData.id, {}, formData);
      } else {
        result = await submitTractorWork({}, formData);
      }

      if (result?.success === false) {
        setError(result.message);
      } else {
        setSuccess(
          isEditing
            ? "Work updated successfully"
            : "Work submitted successfully"
        );
        if (!isEditing) {
          form.reset();
        }
        router.push(`/tractor/${tractorID}`);
      }
    } catch {
      setError(isEditing ? "Failed to update work" : "Failed to submit work");
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
                  <SelectContent className="max-h-[200px] overflow-y-auto">
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
                        "pl-3 text-left font-normal",
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
          name="detail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detail</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter work details" />
              </FormControl>
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

        {equipmentRates.map((equipment) => (
          <FormField
            key={equipment._id}
            control={form.control}
            name={
              `${equipment.name.toLowerCase()}Hours` as keyof WorkFormValues
            }
            render={({ field }) => (
              <FormItem>
                <EquipmentInput
                  name={capitalizeFirstLetter(equipment.name)}
                  ratePerHour={equipment.rate}
                  hours={Number(field.value)}
                  amount={calculateAmount(Number(field.value), equipment.rate)}
                  onHoursChange={(hours) => field.onChange(hours)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="text-lg font-semibold">
          Total Amount: <span>{totalAmount}</span>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={submitting || success !== null}
        >
          {submitting
            ? "Submitting..."
            : isEditing
            ? "Update Work"
            : "Submit Work"}
        </Button>
      </form>
    </Form>
  );
}
