import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { GOALS } from "@/lib/playbook";

export function GoalsSection() {
  return (
    <Section
      id="goals"
      eyebrow="04 — Дорожная карта"
      title="Три горизонта. За год — правда и домены. За пять — паритет практик с глобальным ритейл-ИТ"
      lead="Цель «стать как Amazon» без горизонта — постер. 12 месяцев ставят операционную систему. 3 года дают платформы, на которых коммерция работает сама. 5 лет — касса, канал и поставка ощущаются как у сильного мирового ритейла. Выручки нет, поэтому горизонты про поток, SLO и стоимость сервиса."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {GOALS.map((goal, index) => (
          <article
            key={goal.horizon}
            className="flex flex-col rounded-2xl border border-border bg-card/40 p-6"
          >
            <Badge variant="outline" className="w-fit">
              Горизонт 0{index + 1}
            </Badge>
            <h3 className="font-heading mt-4 text-2xl">{goal.horizon}</h3>
            <p className="mt-1 text-sm text-primary">{goal.subtitle}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{goal.thesis}</p>
            <ul className="mt-6 space-y-4">
              {goal.outcomes.map((outcome) => (
                <li key={outcome.title}>
                  <p className="text-sm font-medium">{outcome.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {outcome.detail}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-auto border-t border-border pt-5">
              <p className="text-xs tracking-wide text-destructive/90 uppercase">
                Убить ставку, если
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {goal.killIf.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
