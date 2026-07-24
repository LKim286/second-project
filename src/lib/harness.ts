import { Agent, type AgentOptions, type ModelSelection } from "@cursor/sdk";

/**
 * Harness = обвязка вокруг модели:
 * runtime (local/cloud) + tools/MCP + skills + hooks + subagents.
 * Модель сама по себе — только inference; harness даёт агенту контекст и действия.
 */
export type HarnessMode = "local" | "cloud";

export interface CreateHarnessOptions {
  model?: ModelSelection;
  mode?: HarnessMode;
  cwd?: string;
  repoUrl?: string;
  startingRef?: string;
  autoCreatePR?: boolean;
  /** Именованные subagents, которых родитель может делегировать через Agent tool */
  agents?: AgentOptions["agents"];
  /** Inline MCP (для local обычно достаточно .cursor/mcp.json + settingSources) */
  mcpServers?: AgentOptions["mcpServers"];
}

export async function createModelHarness(options: CreateHarnessOptions = {}) {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Нужен CURSOR_API_KEY. Создайте ключ: https://cursor.com/dashboard/api",
    );
  }

  const model: ModelSelection = options.model ?? { id: "composer-2.5" };
  const mode = options.mode ?? "local";

  if (mode === "cloud") {
    const repoUrl =
      options.repoUrl ?? process.env.CURSOR_REPO_URL ?? undefined;
    if (!repoUrl) {
      throw new Error(
        "Для cloud-harness укажите repoUrl или CURSOR_REPO_URL",
      );
    }

    return Agent.create({
      apiKey,
      model,
      agents: options.agents,
      mcpServers: options.mcpServers,
      cloud: {
        repos: [
          {
            url: repoUrl,
            startingRef:
              options.startingRef ?? process.env.CURSOR_REPO_REF ?? "main",
          },
        ],
        autoCreatePR: options.autoCreatePR ?? false,
      },
    });
  }

  return Agent.create({
    apiKey,
    model,
    agents: options.agents,
    mcpServers: options.mcpServers,
    local: {
      cwd: options.cwd ?? process.cwd(),
      // Подтянуть skills/hooks/MCP/subagents из .cursor/ репозитория
      settingSources: ["project"],
    },
  });
}

/** Дождаться завершения run и вернуть итоговый текст агента. */
export async function waitForText(
  run: Awaited<ReturnType<Awaited<ReturnType<typeof Agent.create>>["send"]>>,
): Promise<{ text: string; status: string }> {
  const result = await run.wait();
  return {
    text: (result.result ?? run.result ?? "").trim(),
    status: result.status,
  };
}
