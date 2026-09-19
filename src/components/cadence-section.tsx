import { Section } from "@/components/section";
import { CADENCE } from "@/lib/playbook";

export function CadenceSection() {
  return (
    <Section
      id="cadence"
      eyebrow="07 — Каденция"
      title="Ритм, в котором метрики становятся решениями и премией"
      lead="Метрика без каденции — коллекционирование. Каденция без kill-criteria — ритуал. Ниже — минимум для ИТ сети. Пик — отдельный цикл, не «надеемся». Всё лишнее в календаре должно уметь умереть."
    >
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-[11px] w-px bg-border sm:left-[15px]" />
        <ol className="space-y-6">
          {CADENCE.map((item) => (
            <li key={item.name} className="relative pl-10 sm:pl-12">
              <span className="absolute top-1.5 left-0 size-6 rounded-full border border-primary/40 bg-background sm:size-8" />
              <span className="absolute top-3 left-2 size-2 rounded-full bg-primary sm:top-3.5 sm:left-3" />
              <h3 className="font-heading text-xl">{item.name}</h3>
              <p className="mt-1 text-sm text-primary">{item.duration}</p>
              <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground">
                {item.items.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
