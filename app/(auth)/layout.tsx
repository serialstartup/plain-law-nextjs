export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-linear-to-b from-background to-muted/30 p-4">
      {/* <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">PlainLaw</h1>
          <p className="text-sm text-muted-foreground">Hızlı ve anlaşılır sözleşme analizi</p>
        </div> */}
      {children}
    </div>
  );
}
