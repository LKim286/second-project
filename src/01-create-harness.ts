/**
 * Пример 1: создать harness для модели.
 *
 * Запуск:
 *   export CURSOR_API_KEY=...
 *   npm run harness
 */
import { createModelHarness, waitForText } from "./lib/harness.js";

const agent = await createModelHarness({
  mode: "local",
  model: { id: "composer-2.5" },
  // Subagents — часть harness: модель может делегировать специализированные задачи
  agents: {
    "code-reviewer": {
      description: "Ревьюер кода: баги, безопасность, читаемость",
      prompt:
        "Ты строгий code reviewer. Кратко перечисляй findings с severity.",
      model: "inherit",
    },
  },
});

console.log(`Harness готов. agentId=${agent.agentId}`);
console.log(`Модель: ${JSON.stringify(agent.model)}`);

const run = await agent.send(
  "Кратко опиши, что делает этот репозиторий и какие файлы относятся к harness/пайплайну.",
);

const { text, status } = await waitForText(run);
console.log(`\n--- ответ агента (status=${status}) ---\n`);
console.log(text || "(нет текстового ответа)");

await agent.close();
