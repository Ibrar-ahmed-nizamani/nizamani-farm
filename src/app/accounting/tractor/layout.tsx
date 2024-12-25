export default function TractorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <h2 className="text-2xl ">Tractor Customers</h2>
      {children}
    </>
  );
}
