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

directory="./public"
search="example.org"
replace="repasscloud.com"

# Replace domain in all generated files safely (handles spaces/newlines)
grep -rlZ -- "$search" "$directory" | xargs -0 "$SED" -i "s/${search}/${replace}/g"
echo "Domain replacement complete."

# Update CNAME
cp ./CNAME ./public/CNAME

# Replace "Made with ❤️ using Gokarna" footer with Sydney line (both href variants)
# NOTE: replacement must escape '&' as '\&' so it stays literal HTML entity.
find ./public -type f -name "*.html" -exec gsed -i -E \
  's#Made with &#10084;&#65039; using <a target="_blank" href="https://github\.com/(gokarna-theme/gokarna-hugo|526avijitgupta/gokarna)">Gokarna</a>#Made with \&#10084;\&#65039; in Sydney, Australia#g' \
  {} +
echo "Footer replacement complete."

grep -RIn --include="*.html" 'Made with &#10084;&#65039;' ./docs | head -n 20

echo "Deploy completed."