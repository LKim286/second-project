"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { DIAGNOSTIC, scoreLabel } from "@/lib/playbook";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "efficiency-os-diagnostic-retail";
const EVENT = "efficiency-os-diagnostic";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(EVENT, onStoreChange);
  };
}

function getRaw() {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

function writeAnswers(next: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function DiagnosticSection() {
  const raw = useSyncExternalStore(subscribe, getRaw, () => "");
  const answers = useMemo(() => {
    if (!raw) return {} as Record<string, boolean>;
    try {
      return JSON.parse(raw) as Record<string, boolean>;
    } catch {
      return {};
    }
  }, [raw]);

  const yesCount = DIAGNOSTIC.filter((item) => answers[item.id]).length;
  const score = Math.round((yesCount / DIAGNOSTIC.length) * 100);
  const label = useMemo(() => scoreLabel(score), [score]);
  const loops = [...new Set(DIAGNOSTIC.map((item) => item.loop))];

  return (
    <Section
      id="diagnostic"
      eyebrow="09 — Диагностика"
      title="Двадцать вопросов. Честный «нет» ценнее красивого «да»"
      lead="Отметьте только то, что правда сегодня, не в дорожной карте к сезону. Результат в браузере. Это проверка, собрана ли машина, без которой паритет с гигантами остаётся слайдом."
    >
      <div className="rounded-2xl border border-border bg-card/50 p-5 sm:p-7">
        <Progress value={score} className="mb-2">
          <ProgressLabel>Готовность операционной системы</ProgressLabel>
          <ProgressValue />
        </Progress>
        <p className="font-heading mt-4 text-2xl">{label.title}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {yesCount} из {DIAGNOSTIC.length} · {label.text}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => writeAnswers({})}>
          Сбросить ответы
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        {loops.map((loop) => (
          <div key={loop}>
            <h3 className="font-heading text-sm tracking-wide text-primary uppercase">
              {loop}
            </h3>
            <ul className="mt-3 space-y-2">
              {DIAGNOSTIC.filter((item) => item.loop === loop).map((item) => {
                const on = Boolean(answers[item.id]);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() =>
                        writeAnswers({ ...answers, [item.id]: !answers[item.id] })
                      }
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition-colors",
                        on
                          ? "border-primary/40 bg-primary/10"
                          : "border-border bg-card/30 hover:bg-secondary/50",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border text-[10px]",
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-transparent",
                        )}
                      >
                        ✓
                      </span>
                      {item.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
