import { ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="grid-fade pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
        <Badge variant="outline" className="h-auto border-primary/30 px-3 py-1 text-primary">
          ИТ ритейла · 6500 человек в компании · сервис, не P&amp;L
        </Badge>
        <h1 className="mt-6 max-w-4xl text-4xl leading-[1.1] font-medium tracking-tight sm:text-6xl">
          Как внутреннему ИТ дотянуть технологии до мировых гигантов
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Выручки у подразделения нет. Эффективность — это скорость и надёжность
          кассы, канала и поставки на единицу сильного инженера и рубля run-cost.
          Ориентир — Walmart Global Tech, Inditex, Tesco Technology, Amazon retail,
          не «освоить бюджет» и не загрузка 95%.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#metrics"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            12 метрик штаба и пороги
          </a>
          <a
            href="#rewards"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-secondary"
          >
            Система вознаграждения
          </a>
        </div>
        <p className="mt-16 flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowDown className="size-4" />
          Дорожная карта на 12 месяцев / 3 года / 5 лет, каденция, премии без героизма и тикетов.
        </p>
      </div>
    </section>
  );
}
