"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h2 className="text-xl font-semibold text-neutral-900">
        Something went wrong!
      </h2>
      <p className="mt-2 text-sm text-neutral-500">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
