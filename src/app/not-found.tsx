import Logo from "@/components/Logo";

export default function Page() {
  return (
    <main className="h-screen">
      <section className="h-full">
        <div className="max flex flex-col items-center h-full justify-center gap-2">
          <Logo size="md" />
          <h1 className="text-3xl font-semibold">Page not found</h1>
        </div>
      </section>
    </main>
  );
}
