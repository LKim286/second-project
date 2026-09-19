import { Section } from "@/components/section";
import { ANTIPATTERNS } from "@/lib/playbook";

export function AntipatternsSection() {
  return (
    <Section
      id="antipatterns"
      eyebrow="08 — Антипаттерны"
      title="Как ИТ ритейла выглядит занятым и стоит на месте"
      lead="Ловушки маскируются под дисциплину: высокая загрузка, CAB, освоение бюджета, герои сезона, «ритейл-специфика». Их нужно называть вслух — иначе штаб будет награждать потолок."
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
