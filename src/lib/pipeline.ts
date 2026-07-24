import type { SDKAgent } from "@cursor/sdk";
import { waitForText } from "./harness.js";

/**
 * Свой пайплайн = последовательность шагов поверх одного harness.
 * Каждый шаг — отдельный agent.send() с явным промптом и критерием успеха.
 */
export interface PipelineStep {
  id: string;
  title: string;
  /** Промпт для агента. Получает артефакты предыдущих шагов. */
  prompt: (ctx: PipelineContext) => string;
  /** Опциональная проверка: шаг провален, если вернула ошибку */
  validate?: (output: string, ctx: PipelineContext) => string | null;
}

export interface PipelineContext {
  artifacts: Record<string, string>;
  failed?: { stepId: string; reason: string };
}

export interface PipelineResult {
  ok: boolean;
  artifacts: Record<string, string>;
  failed?: { stepId: string; reason: string };
}

export async function runPipeline(
  agent: SDKAgent,
  steps: PipelineStep[],
): Promise<PipelineResult> {
  const ctx: PipelineContext = { artifacts: {} };

  for (const step of steps) {
    console.log(`\n── [${step.id}] ${step.title}`);
    const prompt = step.prompt(ctx);
    const run = await agent.send(prompt);
    const { text, status } = await waitForText(run);

    if (status === "error" || status === "cancelled") {
      ctx.failed = {
        stepId: step.id,
        reason: `run status: ${status}`,
      };
      console.error(`✗ ${step.id}: ${ctx.failed.reason}`);
      return { ok: false, artifacts: ctx.artifacts, failed: ctx.failed };
    }

    ctx.artifacts[step.id] = text;
    console.log(text.slice(0, 500) || "(пусто)");

    if (step.validate) {
      const err = step.validate(text, ctx);
      if (err) {
        ctx.failed = { stepId: step.id, reason: err };
        console.error(`✗ ${step.id}: ${err}`);
        return { ok: false, artifacts: ctx.artifacts, failed: ctx.failed };
      }
    }

    console.log(`✓ ${step.id}`);
  }

  return { ok: true, artifacts: ctx.artifacts };
}
