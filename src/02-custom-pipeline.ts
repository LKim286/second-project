/**
 * Пример 2: свой пайплайн поверх harness.
 *
 * Шаги: explore → plan → implement → review
 * Один agent (одна сессия) проходит все стадии — контекст сохраняется.
 *
 * Запуск:
 *   export CURSOR_API_KEY=...
 *   npm run pipeline
 *   npm run pipeline:cloud   # нужен CURSOR_REPO_URL
 */
import { createModelHarness } from "./lib/harness.js";
import { runPipeline, type PipelineStep } from "./lib/pipeline.js";

const useCloud = process.argv.includes("--cloud");

const agent = await createModelHarness({
  mode: useCloud ? "cloud" : "local",
  model: { id: "composer-2.5" },
  autoCreatePR: useCloud,
  agents: {
    "code-reviewer": {
      description: "Ревьюер финального диффа",
      prompt:
        "Проверь изменения на регрессии и стиль. Верни PASS или FAIL + список.",
      model: "inherit",
    },
  },
});

const steps: PipelineStep[] = [
  {
    id: "explore",
    title: "Изучить репозиторий",
    prompt: () =>
      [
        "Изучи структуру репозитория.",
        "Перечисли 3–7 ключевых файлов и одной фразой — зачем каждый.",
        "Не меняй файлы на этом шаге.",
      ].join("\n"),
  },
  {
    id: "plan",
    title: "Составить план",
    prompt: (ctx) =>
      [
        "На основе предыдущего explore составь короткий план улучшения README:",
        "- 3 конкретных пункта",
        "- без воды",
        "",
        "Контекст explore:",
        ctx.artifacts.explore?.slice(0, 2000) ?? "(нет)",
      ].join("\n"),
    validate: (out) =>
      out.length < 40 ? "план слишком короткий" : null,
  },
  {
    id: "implement",
    title: "Внести правки",
    prompt: (ctx) =>
      [
        "Реализуй план: обнови README.md минимальными правками.",
        "Не трогай исходники в src/, если это не нужно для документации.",
        "",
        "План:",
        ctx.artifacts.plan ?? "",
      ].join("\n"),
  },
  {
    id: "review",
    title: "Ревью",
    prompt: (ctx) =>
      [
        "Сделай краткое ревью изменений (можно делегировать code-reviewer).",
        "В конце одной строкой: VERDICT: PASS или VERDICT: FAIL.",
        "",
        "Что было сделано на implement:",
        ctx.artifacts.implement?.slice(0, 1500) ?? "",
      ].join("\n"),
    validate: (out) =>
      /VERDICT:\s*PASS/i.test(out)
        ? null
        : "ожидали VERDICT: PASS",
  },
];

console.log(
  `Пайплайн стартует (${useCloud ? "cloud" : "local"}), agentId=${agent.agentId}`,
);

const result = await runPipeline(agent, steps);
await agent.close();

if (!result.ok) {
  console.error("\nПайплайн упал:", result.failed);
  process.exit(1);
}

console.log("\nПайплайн успешно завершён.");
console.log("Артефакты шагов:", Object.keys(result.artifacts).join(", "));
