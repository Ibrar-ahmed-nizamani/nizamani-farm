import { Separator } from "@/components/ui/separator";

export default function TractorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <h1 className="text-3xl ">Tractor</h1>
      <Separator />
      {children}
    </>
  );
}
