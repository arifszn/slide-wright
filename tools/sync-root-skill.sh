#!/bin/sh
# Regenerate the root SKILL.md from slide-wright/SKILL.md (adds the slide-wright/ path prefix).
# Use --check to fail when the root copy is stale (CI).
set -e
cd "$(dirname "$0")/.."
out=$(sed 's#`references/#`slide-wright/references/#g' slide-wright/SKILL.md)
if [ "$1" = "--check" ]; then
  [ "$out" = "$(cat SKILL.md)" ] || { echo "SKILL.md is stale: run tools/sync-root-skill.sh" >&2; exit 1; }
else
  printf '%s\n' "$out" > SKILL.md
fi
