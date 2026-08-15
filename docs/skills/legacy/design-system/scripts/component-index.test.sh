#!/usr/bin/env bash

set -euo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)
script="$script_dir/component-index.sh"
fixture="$script_dir/test-fixtures/component-map-repo"
explicit_fixture="$script_dir/test-fixtures/explicit-components-repo"
empty_fixture="$script_dir/test-fixtures/empty-repo"
temp_dir=$(mktemp -d)
trap 'rm -rf "$temp_dir"' EXIT

fail() {
  printf 'test failure: %s\n' "$1" >&2
  exit 1
}

assert_equals() {
  [[ "$1" == "$2" ]] || fail "expected [$1], received [$2]"
}

assert_file_has_single_line() {
  [[ $(wc -l < "$1" | tr -d ' ') == 1 ]] || fail "expected one newline-terminated line in $1"
}

expected='Alert:src/components/alert;Badge:src/components/duplicates/alpha/Badge;Badge:src/components/duplicates/beta/Badge;Button:src/components/button;Card:src/components/card;EmailInput:src/components/forms/email-input'

bash "$script" --root "$fixture" > "$temp_dir/first"
assert_file_has_single_line "$temp_dir/first"
assert_equals "$expected" "$(cat "$temp_dir/first")"
if rg -q 'UsePress|FormatLabel|TestOnly|ComponentProps|# Component Map|\| Component \|' "$temp_dir/first"; then
  fail 'index included ignored exports or Markdown presentation'
fi

bash "$script" --root "$fixture" > "$temp_dir/second"
cmp -s "$temp_dir/first" "$temp_dir/second" || fail 'index output is not deterministic'

bash "$script" --root "$explicit_fixture" --components-dir ui-kit > "$temp_dir/explicit"
assert_file_has_single_line "$temp_dir/explicit"
assert_equals 'StatusBadge:ui-kit/atoms/status-badge' "$(cat "$temp_dir/explicit")"

if bash "$script" --root "$empty_fixture" > "$temp_dir/empty-out" 2> "$temp_dir/empty-error"; then
  fail 'missing component directory unexpectedly succeeded'
fi
rg -q 'Expected src/components or components; pass --components-dir <path>' "$temp_dir/empty-error" ||
  fail 'missing component directory error is not actionable'

if PATH=/usr/bin:/bin bash "$script" --root "$fixture" > "$temp_dir/rg-out" 2> "$temp_dir/rg-error"; then
  fail 'missing rg unexpectedly succeeded'
fi
rg -q 'rg is required to build the component index' "$temp_dir/rg-error" ||
  fail 'missing rg error is not actionable'

printf 'component-index tests passed\n'
