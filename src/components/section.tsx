import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 border-t border-border/70 py-16 sm:py-24", className)}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-heading text-xs tracking-[0.22em] text-primary uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          {lead}
        </p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
