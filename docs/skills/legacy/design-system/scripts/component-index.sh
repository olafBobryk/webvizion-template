#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: bash component-index.sh [--root <repository>] [--components-dir <path>]

Discover public TypeScript/TSX component exports and print a compact ComponentName:path index.
EOF
}

fail() {
  printf 'component-index: %s\n' "$1" >&2
  exit 1
}

trim() {
  local value=$1
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

is_component_name() {
  local name=$1
  [[ "$name" =~ ^[A-Z][A-Za-z0-9]*$ && ! "$name" =~ ^[A-Z0-9]+$ ]]
}

source_path() {
  local file=$1
  local relative=${file#"$root"/}
  relative=$(printf '%s' "$relative" | sed 's#/\./#/#g')
  relative=${relative%.ts}
  relative=${relative%.tsx}
  relative=${relative%/index}
  printf '%s' "$relative"
}

is_ignored_file() {
  local file=$1
  case "/$file/" in
    */.git/*|*/.next/*|*/build/*|*/coverage/*|*/dist/*|*/generated/*|*/__generated__/*|*/node_modules/*|*/__mocks__/*|*/__tests__/*|*/constants/*|*/helpers/*|*/hooks/*|*/lib/*|*/types/*|*/utils/*)
      return 0
      ;;
  esac

  case "$file" in
    *.d.ts|*.d.tsx|*.generated.ts|*.generated.tsx|*.spec.ts|*.spec.tsx|*.stories.ts|*.stories.tsx|*.story.ts|*.story.tsx|*.test.ts|*.test.tsx|*/use-*.ts|*/use-*.tsx|*/use[A-Z]*.ts|*/use[A-Z]*.tsx)
      return 0
      ;;
  esac

  return 1
}

resolve_relative_module() {
  local from_file=$1
  local specifier=$2
  local base candidate

  [[ "$specifier" == .* ]] || return 1
  base="$(dirname "$from_file")/$specifier"

  for candidate in "$base" "$base.ts" "$base.tsx" "$base/index.ts" "$base/index.tsx"; do
    if [[ -f "$candidate" ]]; then
      printf '%s' "$candidate"
      return 0
    fi
  done

  return 1
}

record_component() {
  local name=$1
  local file=$2

  if ! is_component_name "$name"; then
    return 0
  fi
  printf '%s:%s\n' "$name" "$(source_path "$file")" >> "$results_file"
}

read_direct_exports() {
  local file=$1 name
  while IFS= read -r name; do
    record_component "$name" "$file"
  done < <(
    rg --no-filename --only-matching --pcre2 \
      '^\s*export\s+(?:declare\s+)?(?:default\s+)?(?:function|class|const|let|var)\s+\K[A-Z][A-Za-z0-9]*\b' \
      "$file" || true
  )
}

read_named_reexports() {
  local file=$1 flattened statement names_part specifier target part name
  flattened=$(tr '\n' ' ' < "$file")

  while IFS= read -r statement; do
    if [[ "$statement" =~ from[[:space:]]*\"([^\"]+)\" ]]; then
      specifier=${BASH_REMATCH[1]}
    elif [[ "$statement" =~ from[[:space:]]*\'([^\']+)\' ]]; then
      specifier=${BASH_REMATCH[1]}
    else
      continue
    fi

    target=$(resolve_relative_module "$file" "$specifier" || printf '%s' "$file")
    names_part=${statement#*\{}
    names_part=${names_part%%\}*}

    IFS=',' read -r -a reexported_parts <<< "$names_part"
    for part in "${reexported_parts[@]}"; do
      part=$(trim "$part")
      [[ -n "$part" && "$part" != type\ * ]] || continue

      if [[ "$part" =~ [[:space:]]as[[:space:]]([A-Z][A-Za-z0-9]*)$ ]]; then
        name=${BASH_REMATCH[1]}
      else
        name=$part
      fi

      record_component "$name" "$target"
    done
  done < <(
    printf '%s\n' "$flattened" |
      rg --no-filename --only-matching --pcre2 \
        'export\s*\{[^}]+\}\s*from\s*[\x22\x27][^\x22\x27]+[\x22\x27]' || true
  )
}

root=$PWD
components_dir=

while (($#)); do
  case $1 in
    --root)
      (($# >= 2)) || fail 'Expected a path after --root.'
      root=$2
      shift 2
      ;;
    --components-dir)
      (($# >= 2)) || fail 'Expected a path after --components-dir.'
      components_dir=$2
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

command -v rg >/dev/null 2>&1 || fail 'rg is required to build the component index.'
[[ -d "$root" ]] || fail "Repository root not found: $root"
root=$(cd "$root" && pwd -P)

if [[ -n "$components_dir" ]]; then
  if [[ "$components_dir" != /* ]]; then
    components_dir="$root/$components_dir"
  fi
  [[ -d "$components_dir" ]] || fail "Component directory not found: $components_dir. Pass an existing path with --components-dir."
elif [[ -d "$root/src/components" ]]; then
  components_dir="$root/src/components"
elif [[ -d "$root/components" ]]; then
  components_dir="$root/components"
else
  fail "No component directory found under $root. Expected src/components or components; pass --components-dir <path> to choose one."
fi

results_file=$(mktemp)
trap 'rm -f "$results_file"' EXIT

while IFS= read -r file; do
  is_ignored_file "$file" && continue
  read_direct_exports "$file"
  read_named_reexports "$file"
done < <(rg --files "$components_dir" -g '*.ts' -g '*.tsx' || true)

joined=$(LC_ALL=C sort -u "$results_file" | paste -sd ';' -)
printf '%s\n' "$joined"
