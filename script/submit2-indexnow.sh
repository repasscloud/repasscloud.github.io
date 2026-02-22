#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# IndexNow submitter (sitemap -> IndexNow)
#
# Env vars:
#   INDEXNOW_KEY            (required)  key filename without .txt
#   INDEXNOW_HOST           (optional)  default: repasscloud.com
#   INDEXNOW_SITEMAP_URL    (optional)  default: https://repasscloud.com/sitemap.xml
#   INDEXNOW_KEY_LOCATION   (optional)  default: https://$HOST/$KEY.txt
#   INDEXNOW_ENDPOINT       (optional)  default: https://api.indexnow.org/indexnow
#   INDEXNOW_BATCH_SIZE     (optional)  default: 10000
# -----------------------------------------------------------------------------

HOST="${INDEXNOW_HOST:-repasscloud.com}"
SITEMAP_URL="${INDEXNOW_SITEMAP_URL:-https://repasscloud.com/sitemap.xml}"
KEY="${INDEXNOW_KEY:-}"
ENDPOINT="${INDEXNOW_ENDPOINT:-https://api.indexnow.org/indexnow}"
BATCH_SIZE="${INDEXNOW_BATCH_SIZE:-10000}"

if [[ -z "${KEY}" ]]; then
  echo "ERROR: INDEXNOW_KEY is not set."
  exit 2
fi

KEY_LOCATION="${INDEXNOW_KEY_LOCATION:-https://${HOST}/${KEY}.txt}"

echo "IndexNow host     : ${HOST}"
echo "Sitemap           : ${SITEMAP_URL}"
echo "KeyLocation       : ${KEY_LOCATION}"
echo "Endpoint          : ${ENDPOINT}"
echo "Batch size        : ${BATCH_SIZE}"

# --- temp working dir (must be created before sitemap parsing) ---
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

urls_file="$tmpdir/urls.txt"
batch_file="$tmpdir/batch.txt"
json_file="$tmpdir/payload.json"
resp_file="$tmpdir/resp.txt"

# --- fetch + parse sitemap into urls_file (supports sitemapindex recursion) ---
python3 - "$SITEMAP_URL" > "$urls_file" <<'PY'
import sys
import urllib.request
import xml.etree.ElementTree as ET

sitemap_url = sys.argv[1]

def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "IndexNowSitemapSubmitter/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")

def parse_sitemap(url: str, out: list[str], seen: set[str]) -> None:
    if url in seen:
        return
    seen.add(url)

    xml_text = fetch(url)
    root = ET.fromstring(xml_text)
    name = root.tag.split("}")[-1].lower()

    if name == "urlset":
        for loc in root.findall(".//{*}loc"):
            if loc.text:
                out.append(loc.text.strip())
        return

    if name == "sitemapindex":
        for loc in root.findall(".//{*}loc"):
            if loc.text:
                parse_sitemap(loc.text.strip(), out, seen)
        return

    raise SystemExit(f"Unknown sitemap shape at {url} (root={root.tag})")

urls: list[str] = []
parse_sitemap(sitemap_url, urls, set())

# de-dupe, preserve first-seen order
seen = set()
for u in urls:
    u = (u or "").strip()
    if u and u not in seen:
        seen.add(u)
        print(u)
PY

TOTAL="$(wc -l < "$urls_file" | tr -d ' ')"
echo "URLs found         : ${TOTAL}"

if [[ "${TOTAL}" -eq 0 ]]; then
  echo "No URLs to submit."
  exit 0
fi

submit_batch() {
  local count
  count="$(wc -l < "$batch_file" | tr -d ' ')"
  if [[ "$count" -eq 0 ]]; then
    return 0
  fi

  # Build JSON payload safely (correct escaping) from batch_file
  python3 - "$HOST" "$KEY" "$KEY_LOCATION" "$batch_file" > "$json_file" <<'PY'
import json, sys
host, key, keyLocation, batch_path = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
with open(batch_path, "r", encoding="utf-8") as f:
    urls = [line.strip() for line in f if line.strip()]
payload = {"host": host, "key": key, "keyLocation": keyLocation, "urlList": urls}
print(json.dumps(payload, ensure_ascii=False))
PY

  echo "Submitting batch   : ${count} URLs"

  http_status="$(curl -sS -o "$resp_file" -w "%{http_code}" \
    -X POST "$ENDPOINT" \
    -H "Content-Type: application/json; charset=utf-8" \
    --data-binary @"$json_file")"

  echo "HTTP status        : ${http_status}"
  if [[ "$http_status" -lt 200 || "$http_status" -ge 300 ]]; then
    echo "Response body:"
    cat "$resp_file"
    exit 1
  fi
}

# --- Fill & submit batches from urls_file (no mapfile/readarray dependency) ---
: > "$batch_file"
n=0
batch_num=1

while IFS= read -r url; do
  [[ -z "$url" ]] && continue

  echo "$url" >> "$batch_file"
  n=$((n + 1))

  if [[ "$n" -ge "$BATCH_SIZE" ]]; then
    echo "Batch #${batch_num}"
    submit_batch
    : > "$batch_file"
    n=0
    batch_num=$((batch_num + 1))
  fi
done < "$urls_file"

if [[ "$n" -gt 0 ]]; then
  echo "Batch #${batch_num}"
  submit_batch
fi

echo "Done."