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
      <div className="grid gap-6 rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
        <p className="font-heading text-xs tracking-[0.18em] text-primary uppercase">
          Простыми словами
        </p>
        <p className="max-w-3xl text-xl leading-snug sm:text-2xl">
          ИТ эффективно, когда магазин и коммерция быстрее получают результат — и на это
          уходит меньше редких людей, меньше денег на «поддержать как есть» и меньше
          согласований.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-secondary/50 p-4">
            <p className="text-xs tracking-wide text-primary uppercase">Хотим больше (числитель)</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>
                <span className="text-foreground">Скорость ценности.</span> Коммерция решила
                акцию сегодня — на кассе и на ценнике она живая не через квартал, а в дни
                или часы.
              </li>
              <li>
                <span className="text-foreground">Надёжность пика.</span> 31 декабря и день
                зарплаты касса не падает. Сеть торгует, а не «все в чате спасают».
              </li>
              <li>
                <span className="text-foreground">Способность меняться.</span> Новый слот
                доставки, правило приёмки, график смен — это настройка, а не годовой проект.
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Хотим меньше на единицу результата (знаменатель)
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>
                <span className="text-foreground">Время сильных инженеров.</span> Их мало.
                Если они сидят в согласованиях и ручных выкладках, акция не едет.
              </li>
              <li>
                <span className="text-foreground">Run-cost.</span> Деньги и люди на «чтобы
                вчерашние системы просто дышали». Расти должен результат, не счёт за сопровождение.
              </li>
              <li>
                <span className="text-foreground">Трение согласований.</span> Комитеты, CAB,
                служебные записки, «давайте ещё раз обсудим» — налог на каждую мелочь.
              </li>
            </ul>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <p className="text-sm leading-6 text-muted-foreground">
            <span className="text-foreground">Плохой рост «внизу».</span> Людей и подрядчиков
            всё больше, комитетов всё больше, а акция по-прежнему едет три недели. Снаружи
            выглядит как работа: проекты, статусы, загрузка 95%. По сути это фабрика
            занятости, не сервис магазину.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            <span className="text-foreground">Плохое сокращение «внизу».</span> Уволили тех,
            кто знал кассу, платформу не построили. Квартал дешевле. В пик снова герои и
            простой. Знания ушли — к сезону вы слабее, не эффективнее.
          </p>
        </div>
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
