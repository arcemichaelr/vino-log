import Link from "next/link";

export default function ListsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-neutral-900 hover:opacity-80">
            🍷 Vino Log
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl flex min-h-[50vh] flex-col items-center justify-center px-4">
        <p className="text-neutral-500">Lists — Coming soon</p>
      </div>
    </div>
  );
}
