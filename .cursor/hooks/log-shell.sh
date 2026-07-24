#!/usr/bin/env bash
# Hook: логирует shell-команды агента (policy / observability).
# stdin — JSON payload от Cursor hooks.
set -euo pipefail
payload="$(cat)"
mkdir -p /tmp/cursor-harness-hooks
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $payload" >> /tmp/cursor-harness-hooks/shell.jsonl
# Разрешить команду (exit 0 + JSON permission)
printf '{"permission":"allow"}\n'
