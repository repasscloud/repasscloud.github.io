#!/bin/bash
set -euo pipefail

# Require GNU sed (Homebrew: brew install gnu-sed)
if ! command -v gsed >/dev/null 2>&1; then
  echo "ERROR: gsed not found. Install with: brew install gnu-sed" >&2
  exit 1
fi

SED="gsed"

# Clean build output
for dir in public docs; do
  if [ -d "$dir" ]; then
    rm -rf "$dir"
    echo "Removed directory: $dir"
  fi
done

# Build Hugo site
hugo

echo "Deploy completed."