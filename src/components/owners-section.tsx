"use client";

import { useMemo, useState } from "react";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BOARD_SCORECARD,
  METRICS,
  ROLES,
  metricOwners,
  metricsForRole,
  type Metric,
  type RoleId,
} from "@/lib/playbook";

function MetricLine({ metric, kind }: { metric: Metric; kind: "primary" | "co" }) {
  const board = BOARD_SCORECARD.includes(
    metric.id as (typeof BOARD_SCORECARD)[number],
  );
  return (
    <li className="rounded-xl border border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">{metric.name}</p>
        {kind === "primary" ? <Badge>Основной</Badge> : <Badge variant="outline">Совладелец</Badge>}
        {board ? <Badge variant="outline">Board-12</Badge> : null}
        <Badge variant="outline">{metric.cadence}</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.definition}</p>
      <p className="mt-2 text-sm text-primary">12 мес.: {metric.year1}</p>
    </li>
  );
}

export function OwnersSection() {
  const [roleId, setRoleId] = useState<RoleId>("biztech");
  const role = ROLES.find((item) => item.id === roleId)!;
  const { primary, contributing } = useMemo(() => metricsForRole(roleId), [roleId]);

  return (
    <Section
      id="owners"
      eyebrow="03 — Владельцы"
      title="У каждой метрики один основной владелец. Совладельцы не размывают ответственность"
      lead="Директора держат штабные числа. CTO доменов — lead time, SLO и self-service своего контура. Если метрика красная, спрашивают основного. Совладелец не может сказать «это не моё», но и не прячется за комитетом."
    >
      <div className="flex flex-wrap gap-2">
        {ROLES.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={roleId === item.id ? "default" : "outline"}
            onClick={() => setRoleId(item.id)}
          >
            {item.title}
          </Button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card/40 p-6">
        <h3 className="font-heading text-2xl">{role.title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{role.mandate}</p>
        <p className="mt-4 text-sm text-primary">
          Основных метрик: {primary.length} · совладение: {contributing.length}
        </p>
      </div>

      <h4 className="mt-8 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Основной владелец — премия и разбор
      </h4>
      <ul className="mt-3 grid gap-3">
        {primary.map((metric) => (
          <MetricLine key={metric.id} metric={metric} kind="primary" />
        ))}
      </ul>

      {contributing.length ? (
        <>
          <h4 className="mt-8 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Совладелец — без права сказать «не моё»
          </h4>
          <ul className="mt-3 grid gap-3">
            {contributing.map((metric) => (
              <MetricLine key={metric.id} metric={metric} kind="co" />
            ))}
          </ul>
        </>
      ) : null}

      <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Метрика Board-12</th>
              <th className="px-4 py-3 font-medium">Основной</th>
              <th className="px-4 py-3 font-medium">Совладельцы</th>
            </tr>
          </thead>
          <tbody>
            {BOARD_SCORECARD.map((id) => {
              const metric = METRICS.find((item) => item.id === id)!;
              const owners = metricOwners(metric);
              return (
                <tr key={id} className="border-t border-border">
                  <td className="px-4 py-3">{metric.name}</td>
                  <td className="px-4 py-3">{owners.primary.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {owners.co.map((item) => item.title).join(", ") || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
