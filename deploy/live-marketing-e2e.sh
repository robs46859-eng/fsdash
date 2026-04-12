#!/usr/bin/env bash
# End-to-end Marketing Studio + economics check against production same-origin host.
#
# Prerequisites on Cloud Run (fs-ai):
#   - FULLSTACK_BOOTSTRAP_ADMIN_EMAIL + FULLSTACK_BOOTSTRAP_ADMIN_PASSWORD (or SHA256) set
#   - FULLSTACK_MARKETING_PROVIDER_BASE_URL, MODEL, and API key or AUTH_TOKEN set
#
# Usage:
#   export BASE_URL="https://fullstack.arkhamprison.com"
#   export BOOTSTRAP_EMAIL="operator@fullstack.arkhamprison.com"
#   export BOOTSTRAP_PASSWORD="***"
#   ./deploy/live-marketing-e2e.sh
#
set -euo pipefail

BASE_URL="${BASE_URL:-https://fullstack.arkhamprison.com}"
BOOTSTRAP_EMAIL="${BOOTSTRAP_EMAIL:-operator@fullstack.arkhamprison.com}"
die() { echo "ERROR: $*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "missing: $1 (install or use python3 only)"; }
need_cmd curl
need_cmd python3

API="${BASE_URL}/api/v1"
AUTH_ARGS=()
CURL_MAX_TIME="${CURL_MAX_TIME:-20}"
CURL_CONNECT_TIMEOUT="${CURL_CONNECT_TIMEOUT:-10}"

api_curl() {
  curl --connect-timeout "$CURL_CONNECT_TIMEOUT" --max-time "$CURL_MAX_TIME" "$@"
}

bootstrap_token() {
  local bootstrap_file="/tmp/live-marketing-bootstrap.json"
  api_curl -fsS \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${BOOTSTRAP_EMAIL}\",\"password\":\"${BOOTSTRAP_PASSWORD}\"}" \
    "${API}/session/bootstrap" -o "$bootstrap_file"
  python3 - "$bootstrap_file" <<'PY'
import json, sys
payload = json.load(open(sys.argv[1]))
print(payload.get("bearer_token", ""))
PY
}

echo "=== GET ${API}/session (unauthenticated) ==="
api_curl -sS -w "\nHTTP %{http_code}\n" "${API}/session" | head -40

echo ""
echo "=== POST ${API}/session/bootstrap ==="
[[ -n "${BOOTSTRAP_PASSWORD:-}" ]] || die "Set BOOTSTRAP_PASSWORD"
TOKEN="$(bootstrap_token)"
[[ -n "$TOKEN" ]] || die "bootstrap did not yield a bearer token"
AUTH_ARGS=( -H "Authorization: Bearer ${TOKEN}" )
python3 -m json.tool /tmp/live-marketing-bootstrap.json
echo ""

echo "=== GET ${API}/session (with bootstrap bearer token) ==="
api_curl -fsS "${AUTH_ARGS[@]}" "${API}/session" | python3 -m json.tool
echo ""

echo "=== GET ${API}/marketing/economics (before) ==="
api_curl -fsS "${AUTH_ARGS[@]}" "${API}/marketing/economics" -o /tmp/econ-before.json
python3 -m json.tool /tmp/econ-before.json | head -60

GEN_JSON=/tmp/gen-out.json
echo ""
echo "=== POST ${API}/marketing/generate (ad-copy, channels for channel_package_total) ==="
# Two channels -> channel_package_count 2 for headline cost_per_channel_package_usd denominator
api_curl -fsS "${AUTH_ARGS[@]}" \
  -H "Content-Type: application/json" \
  -d '{
    "generator_id": "ad-copy",
    "title": "Live E2E",
    "values": {
      "campaignGoal": "Reliability beta",
      "audience": "Platform operators",
      "offer": "Controlled trial",
      "tone": "Direct",
      "channels": "LinkedIn, Search"
    }
  }' \
  "${API}/marketing/generate" | tee "$GEN_JSON" | python3 -m json.tool

DRAFT_ID="$(python3 -c "import json; print(json.load(open('$GEN_JSON'))['draft']['id'])")"
echo "Draft ID: $DRAFT_ID"

echo ""
echo "=== PATCH ${API}/marketing/drafts/${DRAFT_ID} (save revision / accepted asset) ==="
api_curl -fsS "${AUTH_ARGS[@]}" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{"content":"Accepted revision body for economics (accepted_asset event).","label":"e2e-save"}' \
  "${API}/marketing/drafts/${DRAFT_ID}" | python3 -m json.tool

echo ""
echo "=== POST ${API}/marketing/drafts/${DRAFT_ID}/export ==="
api_curl -fsS "${AUTH_ARGS[@]}" \
  -H "Content-Type: application/json" \
  -d '{"action":"download-text"}' \
  "${API}/marketing/drafts/${DRAFT_ID}/export" | python3 -m json.tool

echo ""
echo "=== GET ${API}/marketing/economics (after) ==="
api_curl -fsS "${AUTH_ARGS[@]}" "${API}/marketing/economics" -o /tmp/econ-after.json
python3 -m json.tool /tmp/econ-after.json | head -80

echo ""
echo "=== Headline + totals diff (before vs after) ==="
python3 << 'PY'
import json
before = json.load(open("/tmp/econ-before.json"))
after = json.load(open("/tmp/econ-after.json"))

def show(name, d):
    h = d.get("headline") or {}
    t = d.get("totals") or {}
    print(f"--- {name} ---")
    print("  headline.cost_per_draft_usd:        ", h.get("cost_per_draft_usd"))
    print("  headline.cost_per_approved_asset_usd:", h.get("cost_per_approved_asset_usd"))
    print("  headline.cost_per_channel_package_usd:", h.get("cost_per_channel_package_usd"))
    print("  headline.total_cost_usd:          ", h.get("total_cost_usd"))
    print("  totals.draft_count:               ", t.get("draft_count"))
    print("  totals.accepted_asset_count:      ", t.get("accepted_asset_count"))
    print("  totals.channel_package_total:     ", t.get("channel_package_total"))

show("BEFORE", before)
show("AFTER", after)
print("""
Expect AFTER >= BEFORE on activity and costs. Headline ratios update from totals:
  cost_per_draft_usd uses draft_count (draft_generated events)
  cost_per_approved_asset_usd uses accepted_asset_count (PATCH save)
  cost_per_channel_package_usd uses sum of channel_package_count across activity rows
""")
PY

echo "Done."
