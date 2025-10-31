import { cn } from "@/lib/utils";

export function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("flex-1 p-4 sm:px-6 sm:py-0", className)}>
      {children}
    </main>
  );
}
