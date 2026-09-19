import { Section } from "@/components/section";
import { ANTIPATTERNS } from "@/lib/playbook";

export function AntipatternsSection() {
  return (
    <Section
      id="antipatterns"
      eyebrow="06 — Антипаттерны"
      title="Как российская ИТ-компания выглядит эффективной и стоит на месте"
      lead="Большинство ловушек маскируются под дисциплину: высокая загрузка, много KPI, «своя специфика», герои релизов. Их нужно называть вслух — иначе совет будет награждать потолок."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {ANTIPATTERNS.map((item) => (
          <article key={item.name} className="rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-medium">{item.name}</h3>
              <p className="shrink-0 text-xs text-primary">{item.cost}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
