#!/usr/bin/env bash
# Ordered smoke test for FullStack on Firebase Hosting + Cloud Run (same-origin).
# Usage:
#   export BASE_URL="https://fullstack.arkhamprison.com"
#   export BOOTSTRAP_EMAIL="operator@fullstack.arkhamprison.com"
#   export BOOTSTRAP_PASSWORD="..."   # required if FULLSTACK_TRUST_UPSTREAM_AUTH=false
#   ./deploy/smoke-production.sh
#
# If the backend uses trusted upstream auth instead of bootstrap, set:
#   export USE_UPSTREAM_AUTH=1
#   export UPSTREAM_ACTOR_EMAIL="operator@yourcompany.com"

set -euo pipefail

BASE_URL="${BASE_URL:-https://fullstack.arkhamprison.com}"
CURL_MAX_TIME="${CURL_MAX_TIME:-20}"
CURL_CONNECT_TIMEOUT="${CURL_CONNECT_TIMEOUT:-10}"

die() { echo "ERROR: $*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "missing command: $1"; }

need_cmd curl
need_cmd jq

echo "BASE_URL=$BASE_URL"

api_curl() {
  curl --connect-timeout "$CURL_CONNECT_TIMEOUT" --max-time "$CURL_MAX_TIME" "$@"
}

bootstrap_token() {
  local bootstrap_file="/tmp/fullstack-smoke-bootstrap.json"
  api_curl -fsS \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${BOOTSTRAP_EMAIL}\",\"password\":\"${BOOTSTRAP_PASSWORD}\"}" \
    "$BASE_URL/api/v1/session/bootstrap" -o "$bootstrap_file"
  python3 - "$bootstrap_file" <<'PY'
import json, sys
payload = json.load(open(sys.argv[1]))
print(payload.get("bearer_token", ""))
PY
}

echo "=== 1. Landing / ==="
api_curl -fsS -o /dev/null "$BASE_URL/" || die "landing failed"

echo "=== 2. /access ==="
api_curl -fsS -o /dev/null "$BASE_URL/access" || die "/access failed"

echo "=== 3. /app ==="
api_curl -fsS -o /dev/null "$BASE_URL/app" || die "/app failed"

echo "=== 4. /app/marketing-studio ==="
api_curl -fsS -o /dev/null "$BASE_URL/app/marketing-studio" || die "/app/marketing-studio failed"

echo "=== 5. /app/marketing-economics ==="
api_curl -fsS -o /dev/null "$BASE_URL/app/marketing-economics" || die "/app/marketing-economics failed"

echo "=== 6. /health ==="
api_curl -fsS "$BASE_URL/health" | jq .

echo "=== 7. /ready ==="
api_curl -fsS "$BASE_URL/ready" | jq .

AUTH_HEADER=()
if [[ "${USE_UPSTREAM_AUTH:-0}" == "1" ]]; then
  [[ -n "${UPSTREAM_ACTOR_EMAIL:-}" ]] || die "UPSTREAM_ACTOR_EMAIL required when USE_UPSTREAM_AUTH=1"
  AUTH_HEADER=( -H "X-Fullstack-Actor: ${UPSTREAM_ACTOR_EMAIL}" )
else
  [[ -n "${BOOTSTRAP_EMAIL:-}" && -n "${BOOTSTRAP_PASSWORD:-}" ]] || die "Set BOOTSTRAP_EMAIL and BOOTSTRAP_PASSWORD (or USE_UPSTREAM_AUTH=1)"
  echo "=== Session bootstrap ==="
  TOKEN="$(bootstrap_token)"
  [[ -n "$TOKEN" ]] || die "bootstrap did not yield a bearer token"
  AUTH_HEADER=( -H "Authorization: Bearer ${TOKEN}" )
fi

echo "=== Economics (before) ==="
api_curl -fsS "${AUTH_HEADER[@]}" "$BASE_URL/api/v1/marketing/economics" | tee /tmp/econ-before.json | jq '.totals // .'

echo "=== Marketing: one generation ==="
api_curl -fsS "${AUTH_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"generator_id":"ad-copy","title":"Smoke test","values":{"campaignGoal":"Awareness","audience":"Operators","offer":"Trial","tone":"Direct"}}' \
  "$BASE_URL/api/v1/marketing/generate" | tee /tmp/gen.json | jq .

DRAFT_ID="$(jq -r '.draft.id // empty' /tmp/gen.json)"
[[ -n "$DRAFT_ID" ]] || die "generation did not return draft id (check provider env on Cloud Run)"

echo "=== Draft save (PATCH) ==="
api_curl -fsS "${AUTH_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{"content":"Smoke test — edited body for economics ledger.","label":"smoke-save"}' \
  "$BASE_URL/api/v1/marketing/drafts/${DRAFT_ID}" | tee /tmp/patch.json | jq .

echo "=== Export ==="
api_curl -fsS "${AUTH_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"action":"download-text"}' \
  "$BASE_URL/api/v1/marketing/drafts/${DRAFT_ID}/export" | tee /tmp/export.json | jq .

echo "=== Economics (after) ==="
api_curl -fsS "${AUTH_HEADER[@]}" "$BASE_URL/api/v1/marketing/economics" | tee /tmp/econ-after.json | jq .

echo "=== Diff totals ( jq ) ==="
BEFORE="$(jq -c '.totals // {}' /tmp/econ-before.json)"
AFTER="$(jq -c '.totals // {}' /tmp/econ-after.json)"
echo "before: $BEFORE"
echo "after:  $AFTER"

echo "OK: smoke sequence completed."
