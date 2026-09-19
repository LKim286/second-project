import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LOOPS, NORTH_STARS } from "@/lib/playbook";

export function ConceptSection() {
  return (
    <Section
      id="concept"
      eyebrow="01 — Концепция"
      title="Эффективность = сложный процент ценности, а не дешёвый час"
      lead="Российские ИТ-компании часто оптимизируют стоимость ресурса: ставку инженера, загрузку, headcount. Компании, которые задают стандарт категории, оптимизируют стоимость задержки ценности и плотность таланта. Это разные игры. Во вторую нельзя попасть, играя в первую."
    >
      <div className="grid gap-4 rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
        <p className="font-heading text-xs tracking-[0.18em] text-primary uppercase">
          Формула
        </p>
        <p className="max-w-4xl text-xl leading-snug sm:text-2xl">
          Эффективность мирового лидера ={" "}
          <span className="text-primary">
            (скорость создания ценности × качество исхода × масштаб рынка)
          </span>{" "}
          / (время топ-таланта × капитал × организационное трение)
        </p>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Если числитель растёт медленнее знаменателя — вы «эффективно» строите локального
          чемпиона. Если режете знаменатель, уничтожая числитель, — это не эффективность, а
          истощение.
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
          <h3 className="font-heading text-lg">Что считать мировым лидерством</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>Покупатель сравнивает вас с глобальными игроками категории, не с локальными интеграторами.</li>
            <li>Международная выручка — настоящая, без административного ресурса домашнего рынка.</li>
            <li>1% таланта выбирает вас, а не «переезд в FAANG / стартап долины».</li>
            <li>Юнит-экономика читается внешним партнёром без сносок «у нас так принято».</li>
            <li>Инженерная машина — elite DORA, а не квартальные релизы и герои.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border p-6">
          <h3 className="font-heading text-lg">Чем это не является</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>«Крупнейшая ИТ-компания России» — размер домашнего рынка, не лидерство.</li>
            <li>Утилизация людей, сторипоинты, часы, количество сотрудников.</li>
            <li>Аутсорсинг и T&M: можно быть прибыльными и никогда не задать стандарт категории.</li>
            <li>Карго-культ OKR, Spotify и Google без плотности таланта и клина продукта.</li>
            <li>Слоган трансформации при двойной бухгалтерии правды.</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
