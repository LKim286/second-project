import { Section } from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CULTURE } from "@/lib/playbook";

export function CultureSection() {
  return (
    <Section
      id="culture"
      eyebrow="05 — Культура"
      title="Культура — операционная система ритейл-ИТ, не ценности на стене"
      lead="Процессы без культуры — театр CAB. Культура без метрик — поэзия. Десять правил — наблюдаемое поведение в найме, в RFC, на кассе в пик. Если правила не видно в дежурстве 31 декабря — его нет."
    >
      <Accordion multiple className="rounded-2xl border border-border px-4 sm:px-6">
        {CULTURE.map((item, index) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="flex items-baseline gap-3 text-left">
                <span className="font-heading text-xs text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-base sm:text-lg">{item.title}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="max-w-3xl pb-2 text-sm leading-6 text-muted-foreground sm:text-base">
                {item.principle}
              </p>
              <div className="mt-4 mb-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-secondary/60 p-4">
                  <p className="text-xs tracking-wide text-primary uppercase">
                    Это выглядит как
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6">
                    {item.looksLike.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-secondary/30 p-4">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    Это не выглядит как
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {item.notLike.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
