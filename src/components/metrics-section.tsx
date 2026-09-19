"use client";

import { useMemo, useState } from "react";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BOARD_SCORECARD,
  LOOPS,
  METRICS,
  metricOwners,
  type Metric,
} from "@/lib/playbook";
import { cn } from "@/lib/utils";

function MetricCard({ metric, board }: { metric: Metric; board: boolean }) {
  return (
    <article className="rounded-xl border border-border bg-card/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-medium">{metric.name}</h3>
        <div className="flex gap-1">
          {board ? <Badge>Board</Badge> : null}
          <Badge variant="outline">{metric.cadence}</Badge>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.definition}</p>
      {metric.formula ? (
        <p className="mt-3 font-mono text-xs text-primary">{metric.formula}</p>
      ) : null}
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Типичное ИТ ритейла</dt>
          <dd className="mt-1 text-sm">{metric.localChampion}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">12 месяцев</dt>
          <dd className="mt-1 text-sm text-primary">{metric.year1}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">3 года</dt>
          <dd className="mt-1 text-sm">{metric.year3}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">5 лет</dt>
          <dd className="mt-1 text-sm">{metric.year5}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm">
        <span className="text-muted-foreground">Основной владелец: </span>
        {metricOwners(metric).primary.title}
      </p>
      {metricOwners(metric).co.length ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Совладельцы: {metricOwners(metric).co.map((role) => role.title).join(", ")}
        </p>
      ) : null}
      <p className="mt-1 text-sm text-destructive/90">Красный флаг: {metric.redFlag}</p>
    </article>
  );
}

export function MetricsSection() {
  const [loopId, setLoopId] = useState<(typeof LOOPS)[number]["id"] | "board">("board");

  const visible = useMemo(() => {
    if (loopId === "board") {
      return BOARD_SCORECARD.map(
        (id) => METRICS.find((metric) => metric.id === id) as Metric,
      );
    }
    return METRICS.filter((metric) => metric.loop === loopId);
  }, [loopId]);

  return (
    <Section
      id="metrics"
      eyebrow="02 — Метрики"
      title="Двенадцать чисел для штаба и розницы. Остальное — приборы доменов"
      lead="Правлению не нужны 80 дашбордов. Board-12 с именным владельцем. CTO доменов держат свои lead time и SLO. Откройте раздел «Владельцы» — фильтр по 14 ролям."
    >
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={loopId === "board" ? "default" : "outline"}
          onClick={() => setLoopId("board")}
        >
          Board-12
        </Button>
        {LOOPS.map((loop) => (
          <Button
            key={loop.id}
            size="sm"
            variant={loopId === loop.id ? "default" : "outline"}
            onClick={() => setLoopId(loop.id)}
          >
            {loop.index} {loop.title}
          </Button>
        ))}
      </div>

      <p className={cn("mt-6 text-sm text-muted-foreground")}>
        {loopId === "board"
          ? "Страница штаба: бизнес, поставка, талант, стоимость сервиса, трение. Нет на странице — нет в докладе правлению."
          : LOOPS.find((loop) => loop.id === loopId)?.thesis}
      </p>

      <div className="mt-8 grid gap-4">
        {visible.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            board={BOARD_SCORECARD.includes(
              metric.id as (typeof BOARD_SCORECARD)[number],
            )}
          />
        ))}
      </div>
    </Section>
  );
}
