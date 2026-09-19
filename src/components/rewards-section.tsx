import { Section } from "@/components/section";
import { REWARDS } from "@/lib/playbook";

export function RewardsSection() {
  return (
    <Section
      id="rewards"
      eyebrow="04 — Вознаграждение"
      title="Платить за кассу, пик и поток. Не за тикеты, часы и героизм"
      lead={REWARDS.thesis}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {REWARDS.principles.map((item) => (
          <article key={item.title} className="rounded-xl border border-border p-5">
            <h3 className="text-lg font-medium">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </div>

      <h3 className="font-heading mt-12 text-xl">Квартальная премия: 15–25% оклада</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        Веса фиксируются до старта квартала. Нет данных по метрике — по ней 0, не «экспертная оценка».
        Провал SLO кассы/оплаты по вине домена режет инженерную часть выплаты до 50%.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {REWARDS.split.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-border bg-card/40 p-6"
          >
            <p className="font-heading text-3xl text-primary">{item.share}</p>
            <h4 className="mt-2 text-lg font-medium">{item.name}</h4>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
              {item.items.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h3 className="font-heading mt-12 text-xl">Когда платят</h3>
      <div className="mt-6 grid gap-4">
        {REWARDS.payout.map((item) => (
          <article
            key={item.when}
            className="grid gap-2 rounded-xl border border-border p-5 md:grid-cols-[10rem_1fr]"
          >
            <div>
              <p className="text-sm font-medium">{item.when}</p>
              <p className="mt-1 text-xs text-primary">{item.money}</p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{item.what}</p>
          </article>
        ))}
      </div>

      <h3 className="font-heading mt-12 text-xl">Кому какая формула</h3>
      <div className="mt-6 grid gap-3">
        {REWARDS.who.map((item) => (
          <div
            key={item.role}
            className="flex flex-col gap-1 rounded-xl border border-border px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <p className="text-sm font-medium">{item.role}</p>
            <p className="text-sm leading-6 text-muted-foreground sm:max-w-xl sm:text-right">
              {item.basedOn}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="text-xs tracking-wide text-destructive/90 uppercase">
          Запрещено включать в премию
        </p>
        <ul className="mt-4 grid gap-2 text-sm leading-6 sm:grid-cols-2">
          {REWARDS.forbid.map((item) => (
            <li key={item}>— {item}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
