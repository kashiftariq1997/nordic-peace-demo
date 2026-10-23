import Link from "next/link";
import { ClientOnly } from "@/components/common";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import { cn } from "@/utils";

export default function Home() {
  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center",
        "text-zinc-900 dark:text-zinc-50",
      )}
    >
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Nordic Peace</h1>
      <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
        Project foundation is in place — folder structure, tooling, and conventions are ready for
        features.
      </p>
      <ClientOnly fallback={<span className="text-sm text-zinc-500">Checking client…</span>}>
        <span className="text-sm text-zinc-500">Hydrated and ready</span>
      </ClientOnly>
      <div className="flex items-center gap-4">
        <Button>Get started</Button>
        <Link
          href={ROUTES.HOME}
          className="text-sm font-medium text-zinc-600 underline underline-offset-4 dark:text-zinc-400"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
