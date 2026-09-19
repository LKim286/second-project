import { Section } from "@/components/section";
import { NINETY_DAYS } from "@/lib/playbook";

export function StartSection() {
  return (
    <Section
      id="start"
      eyebrow="08 — Первые 90 дней"
      title="Не запускайте трансформацию. Установите правду, планку и клин"
      lead="Мировое лидерство не начинается с ребрендинга ценностей. Оно начинается с одной категории, одной страницы метрик, запрета на найм ниже планки и первого международного клиента, который получил ценность в срок. Остальное — следствие."
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
        Пороги на горизонте 12 месяцев / 3 года / 5 лет — ориентиры для продуктовой
        B2B/SaaS-модели. Сервисный бизнес, hardware или marketplace требуют той же
        логики контуров, но других формул маржи и North Star. Не копируйте цифру,
        если у вас другая экономика — копируйте дисциплину: один клин, 12 чисел,
        владелец, красный флаг, kill-criteria.
      </p>
    </Section>
  );
}
