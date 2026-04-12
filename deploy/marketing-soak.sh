#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://fullstack.arkhamprison.com}"
API="${BASE_URL}/api/v1"
BOOTSTRAP_EMAIL="${BOOTSTRAP_EMAIL:-operator@fullstack.arkhamprison.com}"
RUN_HOURS="${RUN_HOURS:-12}"
SLEEP_SECONDS="${SLEEP_SECONDS:-300}"
PROJECT_ID="${PROJECT_ID:-arkham-492414}"
REGION="${REGION:-us-central1}"
CLOUD_RUN_SERVICE="${CLOUD_RUN_SERVICE:-fs-ai}"
LOG_SNAPSHOT_EVERY="${LOG_SNAPSHOT_EVERY:-3}"
OUTPUT_ROOT="${OUTPUT_ROOT:-/Users/joeiton/fsdash/deploy/logs}"
RUN_ID="${RUN_ID:-marketing-soak-$(date -u +%Y%m%dT%H%M%SZ)}"
RUN_DIR="${OUTPUT_ROOT}/${RUN_ID}"
die() { echo "ERROR: $*" >&2; exit 1; }
need_cmd() { command -v "$1" >/dev/null 2>&1 || die "missing command: $1"; }

need_cmd curl
need_cmd python3
need_cmd gcloud

[[ -n "${BOOTSTRAP_PASSWORD:-}" ]] || die "Set BOOTSTRAP_PASSWORD"

mkdir -p "$RUN_DIR"

STATUS_LOG="${RUN_DIR}/run.log"
EVENTS_JSONL="${RUN_DIR}/events.jsonl"
ECONOMICS_JSONL="${RUN_DIR}/economics.jsonl"
CLOUDRUN_LOG="${RUN_DIR}/cloudrun.log"
SUMMARY_TXT="${RUN_DIR}/summary.txt"
LATEST_LINK="${OUTPUT_ROOT}/latest"

rm -f "$LATEST_LINK"
ln -s "$RUN_DIR" "$LATEST_LINK"

run_log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$STATUS_LOG"
}

json_log() {
  local kind="$1"
  local file="$2"
  python3 - "$kind" "$file" >> "$EVENTS_JSONL" <<'PY'
import json, sys, pathlib, datetime
kind = sys.argv[1]
path = pathlib.Path(sys.argv[2])
payload = json.loads(path.read_text())
if kind == "bootstrap" and isinstance(payload, dict) and "bearer_token" in payload:
    payload["bearer_token"] = "[redacted]"
record = {
    "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "kind": kind,
    "payload": payload,
}
print(json.dumps(record, separators=(",", ":")))
PY
}

economics_snapshot() {
  local label="$1"
  local token="$2"
  local outfile="${RUN_DIR}/economics-${label}.json"
  curl -fsS -H "Authorization: Bearer ${token}" "$API/marketing/economics" -o "$outfile"
  python3 - "$label" "$outfile" >> "$ECONOMICS_JSONL" <<'PY'
import json, sys, pathlib, datetime
label = sys.argv[1]
path = pathlib.Path(sys.argv[2])
payload = json.loads(path.read_text())
headline = payload.get("headline") or {}
totals = payload.get("totals") or {}
record = {
    "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "label": label,
    "headline": headline,
    "totals": totals,
}
print(json.dumps(record, separators=(",", ":")))
PY
}

cloudrun_snapshot() {
  {
    printf '\n=== %s ===\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    gcloud run services logs read "$CLOUD_RUN_SERVICE" \
      --region "$REGION" \
      --project "$PROJECT_ID" \
      --limit 40 || true
  } >> "$CLOUDRUN_LOG" 2>&1
}

write_summary() {
  python3 - "$EVENTS_JSONL" "$ECONOMICS_JSONL" > "$SUMMARY_TXT" <<'PY'
import json, pathlib, sys

events_path = pathlib.Path(sys.argv[1])
econ_path = pathlib.Path(sys.argv[2])

events = [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()] if events_path.exists() else []
econ = [json.loads(line) for line in econ_path.read_text().splitlines() if line.strip()] if econ_path.exists() else []

generate_attempts = [e for e in events if e["kind"] == "generate"]
save_attempts = [e for e in events if e["kind"] == "save"]
export_attempts = [e for e in events if e["kind"] == "export"]
failures = [e for e in events if e["payload"].get("ok") is False]
successes = [e for e in events if e["payload"].get("ok") is True]
last_econ = econ[-1] if econ else None

print("Marketing soak summary")
print(f"Generate attempts: {len(generate_attempts)}")
print(f"Save attempts: {len(save_attempts)}")
print(f"Export attempts: {len(export_attempts)}")
print(f"Successful operations: {len(successes)}")
print(f"Failures: {len(failures)}")
if failures:
    print("Last failure:")
    print(json.dumps(failures[-1], indent=2))
if last_econ:
    print("Latest economics headline:")
    print(json.dumps(last_econ["headline"], indent=2))
    print("Latest economics totals:")
    print(json.dumps(last_econ["totals"], indent=2))
PY
}

bootstrap() {
  local bootstrap_file="${RUN_DIR}/bootstrap.json"
  curl -fsS \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${BOOTSTRAP_EMAIL}\",\"password\":\"${BOOTSTRAP_PASSWORD}\"}" \
    "$API/session/bootstrap" -o "$bootstrap_file"
  local token
  token="$(python3 - "$bootstrap_file" <<'PY'
import json, sys
payload = json.load(open(sys.argv[1]))
print(payload.get("bearer_token", ""))
PY
)"
  [[ -n "$token" ]] || die "bootstrap did not yield a bearer token"
  json_log "bootstrap" "$bootstrap_file"
  printf '%s' "$token"
}

refresh_operator_session() {
  TOKEN="$(bootstrap)"
  SESSION_FILE="${RUN_DIR}/session-refresh-$(date -u +%Y%m%dT%H%M%SZ).json"
  curl -fsS -H "Authorization: Bearer ${TOKEN}" "$API/session" -o "$SESSION_FILE"
  json_log "session" "$SESSION_FILE"
  run_log "Operator session refreshed after authorization failure."
}

generate_payload_file() {
  local iteration="$1"
  local outfile="${RUN_DIR}/payload-${iteration}.json"
  local title
  if (( iteration % 3 == 0 )); then
    title="Cache Probe"
  else
    title="Soak Cycle ${iteration}"
  fi
  cat > "$outfile" <<EOF
{"generator_id":"ad-copy","title":"${title}","values":{"campaignGoal":"Reliability beta","audience":"Platform operators","offer":"Controlled trial","tone":"Direct","channels":"LinkedIn, Search","constraints":"Soak iteration ${iteration}"}} 
EOF
  printf '%s' "$outfile"
}

run_log "Run directory: $RUN_DIR"
run_log "Base URL: $BASE_URL"
run_log "Cloud Run service: $CLOUD_RUN_SERVICE ($REGION / $PROJECT_ID)"
run_log "Duration hours: $RUN_HOURS"
run_log "Sleep seconds: $SLEEP_SECONDS"

TOKEN="$(bootstrap)"
run_log "Bootstrap succeeded; using bearer-token flow for operator requests."

SESSION_FILE="${RUN_DIR}/session.json"
curl -fsS -H "Authorization: Bearer ${TOKEN}" "$API/session" -o "$SESSION_FILE"
json_log "session" "$SESSION_FILE"

economics_snapshot "before" "$TOKEN"
write_summary

END_EPOCH=$(( $(date +%s) + RUN_HOURS * 3600 ))
ITERATION=1

while (( $(date +%s) < END_EPOCH )); do
  run_log "Iteration ${ITERATION} started."

  PAYLOAD_FILE="$(generate_payload_file "$ITERATION")"
  GENERATE_FILE="${RUN_DIR}/generate-${ITERATION}.json"
  if curl -fsS -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" \
    -d @"$PAYLOAD_FILE" \
    "$API/marketing/generate" -o "$GENERATE_FILE"; then
    json_log "generate" "$GENERATE_FILE"
    DRAFT_ID="$(python3 - "$GENERATE_FILE" <<'PY'
import json, sys
payload = json.load(open(sys.argv[1]))
print(payload["draft"]["id"])
PY
)"
    python3 - "$GENERATE_FILE" "$ITERATION" "$DRAFT_ID" >> "$EVENTS_JSONL" <<'PY'
import json, sys, datetime
payload = json.load(open(sys.argv[1]))
iteration = int(sys.argv[2])
draft_id = sys.argv[3]
print(json.dumps({
    "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "kind": "generate",
    "payload": {
        "ok": True,
        "iteration": iteration,
        "draft_id": draft_id,
        "provider": payload.get("provider_execution", {}).get("provider"),
        "model": payload.get("provider_execution", {}).get("model"),
        "latency_ms": payload.get("economics", {}).get("latency_ms"),
        "cost_usd": payload.get("economics", {}).get("cost_usd"),
        "cache_status": payload.get("economics", {}).get("cache_status"),
    }
}, separators=(",", ":")))
PY
  else
    HTTP_CODE="$(curl -sS -o "${GENERATE_FILE}" -w '%{http_code}' -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" -d @"$PAYLOAD_FILE" "$API/marketing/generate" || true)"
    python3 - "$GENERATE_FILE" "$ITERATION" "$HTTP_CODE" >> "$EVENTS_JSONL" <<'PY'
import datetime, json, pathlib, sys
path = pathlib.Path(sys.argv[1])
iteration = int(sys.argv[2])
http_code = sys.argv[3]
body = path.read_text() if path.exists() else ""
print(json.dumps({
    "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "kind": "generate",
    "payload": {
        "ok": False,
        "iteration": iteration,
        "http_code": http_code,
        "body": body[:4000],
    }
}, separators=(",", ":")))
PY
    run_log "Iteration ${ITERATION} generate failed with HTTP ${HTTP_CODE}."
    write_summary
    if (( ITERATION % LOG_SNAPSHOT_EVERY == 0 )); then
      cloudrun_snapshot
    fi
    sleep "$SLEEP_SECONDS"
    ITERATION=$((ITERATION + 1))
    continue
  fi

  SAVE_FILE="${RUN_DIR}/save-${ITERATION}.json"
  if curl -fsS -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" \
    -X PATCH \
    -d "{\"content\":\"Accepted revision body for soak iteration ${ITERATION}.\",\"label\":\"soak-save-${ITERATION}\"}" \
    "$API/marketing/drafts/${DRAFT_ID}" -o "$SAVE_FILE"; then
    json_log "save" "$SAVE_FILE"
    python3 - "$ITERATION" "$DRAFT_ID" >> "$EVENTS_JSONL" <<'PY'
import datetime, json, sys
iteration = int(sys.argv[1])
draft_id = sys.argv[2]
print(json.dumps({
    "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "kind": "save",
    "payload": {"ok": True, "iteration": iteration, "draft_id": draft_id}
}, separators=(",", ":")))
PY
  fi

  EXPORT_FILE="${RUN_DIR}/export-${ITERATION}.json"
  if curl -fsS -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" \
    -d '{"action":"download-text"}' \
    "$API/marketing/drafts/${DRAFT_ID}/export" -o "$EXPORT_FILE"; then
    json_log "export" "$EXPORT_FILE"
    python3 - "$EXPORT_FILE" "$ITERATION" "$DRAFT_ID" >> "$EVENTS_JSONL" <<'PY'
import json, sys, datetime
payload = json.load(open(sys.argv[1]))
iteration = int(sys.argv[2])
draft_id = sys.argv[3]
print(json.dumps({
    "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "kind": "export",
    "payload": {
        "ok": True,
        "iteration": iteration,
        "draft_id": draft_id,
        "action": payload.get("action"),
        "cost_usd": payload.get("economics", {}).get("cost_usd"),
    }
}, separators=(",", ":")))
PY
  fi

  economics_snapshot "iter-${ITERATION}" "$TOKEN"
  write_summary

  if (( ITERATION % LOG_SNAPSHOT_EVERY == 0 )); then
    cloudrun_snapshot
  fi

  run_log "Iteration ${ITERATION} completed."
  sleep "$SLEEP_SECONDS"
  ITERATION=$((ITERATION + 1))
done

economics_snapshot "final" "$TOKEN"
cloudrun_snapshot
write_summary
run_log "Soak run completed."
