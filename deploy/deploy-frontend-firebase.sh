#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-arkham-492414}"
HOSTING_SITE="${HOSTING_SITE:-fsai-pro}"

echo "Project: ${PROJECT_ID}"
echo "Hosting site: ${HOSTING_SITE}"

npm run build

firebase use "${PROJECT_ID}"
firebase hosting:sites:create "${HOSTING_SITE}" || true
firebase target:apply hosting fullstack "${HOSTING_SITE}"
firebase deploy --only hosting --project "${PROJECT_ID}"
