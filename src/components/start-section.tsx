import { Section } from "@/components/section";
import { NINETY_DAYS } from "@/lib/playbook";

export function StartSection() {
  return (
    <Section
      id="start"
      eyebrow="10 — Первые 90 дней"
      title="Не запускайте трансформацию. Домены, правда, WIP и формула премии"
      lead="Паритет с гигантами не начинается с нового SAFe и мобильного приложения. Он начинается с пяти доменов, одной страницы метрик, запрета найма ниже планки, перевода части изменений в auto и опубликованной формулы квартальной премии."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {NINETY_DAYS.map((phase) => (
          <article
            key={phase.phase}
            className="rounded-2xl border border-border bg-card/40 p-6"
          >
            <p className="text-xs tracking-wide text-primary uppercase">{phase.phase}</p>
            <h3 className="font-heading mt-2 text-2xl">{phase.title}</h3>
            <ol className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
              {phase.items.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="font-heading text-primary">{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <p className="mt-10 max-w-3xl text-sm leading-6 text-muted-foreground">
        Пороги — ориентир для ИТ сети ~6500 человек, сервисная модель без своей
        выручки. Не копируйте цифру Walmart один в один: копируйте дисциплину.
        Один набор доменов, 12 чисел, владелец, красный флаг, kill-criteria, премия
        по формуле, которая не переписывается после сезона.
      </p>
    </Section>
  );
}
