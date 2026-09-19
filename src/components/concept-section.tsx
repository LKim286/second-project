import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LOOPS, NORTH_STARS } from "@/lib/playbook";

export function ConceptSection() {
  return (
    <Section
      id="concept"
      eyebrow="01 — Концепция"
      title="Эффективность сервисного ИТ = поток ценности в магазин, не дешёвый час"
      lead="При 6500 сотрудниках в ритейле ИТ не обязано зарабатывать. Обязано дать коммерции и магазинам скорость изменения и устойчивость пика на уровне глобальных ритейл-технологий. Оптимизация загрузки людей и «освоения» — другая игра. В паритет с гигантами из неё не попасть."
    >
      <div className="grid gap-4 rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
        <p className="font-heading text-xs tracking-[0.18em] text-primary uppercase">
          Формула
        </p>
        <p className="max-w-4xl text-xl leading-snug sm:text-2xl">
          Эффективность ИТ ритейла ={" "}
          <span className="text-primary">
            (скорость ценности для бизнеса × надёжность пика × способность меняться)
          </span>{" "}
          / (время сильных инженеров × run-cost × трение согласований)
        </p>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Если числитель растёт медленнее знаменателя — вы «эффективно» содержите
          проектную фабрику. Если режете штат, не строя платформу, — это не эффективность,
          а потеря знаний к следующему сезону.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {NORTH_STARS.map((item) => (
          <Card key={item.model}>
            <CardHeader>
              <p className="text-xs text-primary">{item.model}</p>
              <CardTitle className="text-lg">{item.star}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">{item.why}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {LOOPS.map((loop) => (
          <div
            key={loop.id}
            className="rounded-xl border border-border bg-card/40 p-4"
          >
            <p className="font-heading text-xs text-primary">{loop.index}</p>
            <h3 className="mt-2 text-base font-medium">{loop.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{loop.thesis}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <h3 className="font-heading text-lg">Что считать паритетом с гигантами</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>Касса, канал и поставка меняются неделями и днями, не квартальными проектами.</li>
            <li>Пик — обычный день с error budget, не мобилизация героев.</li>
            <li>Коммерция запускает типовую акцию без тикета в ИТ.</li>
            <li>Мозг критического пути внутри, интегратор не является CTO домена.</li>
            <li>DORA и SLO как у сильного ритейл-tech (Walmart, Inditex, Tesco), не как у локального подрядчика.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border p-6">
          <h3 className="font-heading text-lg">Чем это не является</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>Выручка, ARR, Rule of 40 — это не ваша P&amp;L. Не копируйте KPI продуктовой компании.</li>
            <li>Утилизация 95%, сторипоинты, численность ИТ, освоенный бюджет.</li>
            <li>«Цифровая трансформация» как портфель из 40 программ.</li>
            <li>Карго-культ SAFe/Spotify без плотности таланта и без владельца кассы.</li>
            <li>Сокращение людей без платформы: дешевле квартал, дороже простой в пик.</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
