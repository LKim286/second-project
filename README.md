# Model harness + свой пайплайн (Cursor SDK)

Минимальный стартер: как создать **harness для модели** и поверх него — **свой пайплайн**.

## Что такое harness

Модель (Composer / GPT / Claude) — только inference.  
**Harness** — обвязка, которая делает из модели агента:

| Часть | Зачем |
| --- | --- |
| Runtime | `local` (файлы на машине) или `cloud` (VM Cursor) |
| Context | индексация репо, semantic search, grep |
| Tools / MCP | shell, edit, внешние сервисы |
| Skills | навыки из `.cursor/skills/` |
| Hooks | политика и логирование (`.cursor/hooks.json`) |
| Subagents | делегирование (`.cursor/agents/` или `agents:` в коде) |

Cursor SDK даёт тот же harness, что IDE / CLI / Cloud Agents.

## Быстрый старт

```bash
npm install
cp .env.example .env   # вставьте CURSOR_API_KEY с https://cursor.com/dashboard/api
export CURSOR_API_KEY=...

npm run harness      # пример 1: создать harness и один промпт
npm run pipeline     # пример 2: свой пайплайн explore → plan → implement → review
```

Cloud-вариант пайплайна:

```bash
export CURSOR_REPO_URL=https://github.com/you/your-repo
npm run pipeline:cloud
```

## 1. Создать harness для модели

```ts
import { Agent } from "@cursor/sdk";

const agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: "composer-2.5" }, // любая модель из Cursor
  local: {
    cwd: process.cwd(),
    settingSources: ["project"], // подтянуть .cursor/skills, hooks, agents, mcp
  },
  agents: {
    "code-reviewer": {
      description: "Ревьюер кода",
      prompt: "Проверь на баги и безопасность.",
      model: "inherit",
    },
  },
});

const run = await agent.send("Суммируй репозиторий");
for await (const event of run.stream()) {
  console.log(event);
}
await agent.close();
```

В этом репо то же самое вынесено в `src/lib/harness.ts` и `src/01-create-harness.ts`.

Сменить модель — одно поле: `model: { id: "gpt-5.5" }` (список: `Cursor.models.list()`).

## 2. Создать свой пайплайн

Пайплайн = **последовательность шагов** над одним `Agent` (сессия сохраняет контекст):

```
explore → plan → implement → review
```

Каждый шаг — `agent.send(prompt)` + опциональная валидация артефакта.

См. `src/lib/pipeline.ts` и `src/02-custom-pipeline.ts`.

Типичные паттерны:

- **Линейный** — как в примере (CI-бот, auto-fix, docs update)
- **Ветвление** — после `review` при FAIL → шаг `fix`, иначе стоп
- **Параллель** — несколько `Agent.create()` / cloud VM на разные задачи
- **Cloud + PR** — `cloud: { repos, autoCreatePR: true }` и забрать `prUrl` из результата

## Структура

```
src/
  01-create-harness.ts   # минимальный harness
  02-custom-pipeline.ts  # свой пайплайн из 4 шагов
  lib/harness.ts         # фабрика Agent.create
  lib/pipeline.ts        # runner шагов
.cursor/
  agents/                # file-based subagents
  skills/                # skills, которые подхватывает harness
  hooks.json             # политика/логи shell
```

## Документация

- [TypeScript SDK](https://cursor.com/docs/sdk/typescript)
- [Cookbook](https://github.com/cursor/cookbook) — quickstart, kanban, CLI
- [Hooks](https://cursor.com/docs/hooks)
- В Cursor: skill `/sdk`
