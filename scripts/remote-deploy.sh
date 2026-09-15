#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  echo "usage: $0 <deploy-root> <deploy|rollback> <sha> [archive] [keep]" >&2
  exit 2
}

fail() {
  echo "ERROR: $*" >&2
  return 1
}

log() {
  echo "[deploy] $*"
}

deploy_root="${1:-}"
mode="${2:-}"
sha="${3:-}"
archive="${4:-}"
keep="${5:-5}"

[[ -n "$deploy_root" ]] || usage
[[ "$mode" == "deploy" || "$mode" == "rollback" ]] || usage
[[ "$sha" =~ ^[0-9a-fA-F]{7,40}$ ]] || fail "invalid release SHA"
[[ "$keep" =~ ^[1-9][0-9]*$ ]] || fail "keep must be a positive integer"
[[ "$deploy_root" == /* ]] || fail "deploy root must be absolute"
[[ "$deploy_root" == /www/wwwroot/* ]] || fail "deploy root must stay under /www/wwwroot"
[[ "$deploy_root" != "/www/wwwroot" ]] || fail "deploy root is too broad"

releases_dir="${deploy_root}/releases"
incoming_dir="${deploy_root}/incoming"
release_dir="${releases_dir}/${sha}"
blog_link="${deploy_root}/blog"
admin_link="${deploy_root}/admin"

previous_blog=""
previous_admin=""
had_blog=0
had_admin=0

capture_link() {
  local path="$1"
  if [[ -L "$path" ]]; then
    readlink -f "$path"
  elif [[ -e "$path" ]]; then
    fail "deployment target exists and is not a symlink: $path"
  fi
}

switch_link() {
  local target="$1"
  local desired="$2"
  local next="${target}.next.$$"

  if [[ -e "$target" && ! -L "$target" ]]; then
    if [[ -d "$target" && -z "$(find "$target" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
      rmdir "$target"
    else
      fail "cannot replace non-empty non-symlink target: $target"
    fi
  fi

  rm -f -- "$next"
  ln -s "$desired" "$next"
  mv -Tf -- "$next" "$target"
}

restore_link() {
  local target="$1"
  local previous="$2"
  local existed="$3"

  if [[ "$existed" -eq 1 ]]; then
    switch_link "$target" "$previous"
  elif [[ -L "$target" ]]; then
    rm -f -- "$target"
  elif [[ -d "$target" && -z "$(find "$target" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    rmdir "$target"
  fi
}

restore_previous_links() {
  log "restoring previous release links"
  restore_link "$blog_link" "$previous_blog" "$had_blog"
  restore_link "$admin_link" "$previous_admin" "$had_admin"
}

request_page() {
  local url="$1"
  local host="$2"
  curl --fail --silent --show-error --location \
    --retry 5 --retry-all-errors --retry-delay 2 --max-time 20 \
    --resolve "${host}:443:127.0.0.1" "$url"
}

check_asset() {
  local url="$1"
  local host="$2"
  local html
  local asset

  if ! html="$(request_page "$url" "$host")"; then
    return 1
  fi
  asset="$(printf '%s' "$html" | grep -oE '(src|href)="/[^"]+"' | sed -E 's/^(src|href)="//;s/"$//' | head -n 1 || true)"
  [[ -n "$asset" ]] || fail "no root asset found in $url"
  request_page "https://${host}${asset}" "$host" >/dev/null
}

health_check() {
  log "checking blog and admin endpoints"
  check_asset "https://www.chenchen.fun/" "www.chenchen.fun" >/dev/null
  request_page "https://www.chenchen.fun/search" "www.chenchen.fun" >/dev/null
  check_asset "https://admin.chenchen.fun/" "admin.chenchen.fun" >/dev/null
  request_page "https://admin.chenchen.fun/articles/list" "admin.chenchen.fun" >/dev/null
}

validate_release() {
  [[ -f "${release_dir}/blog/index.html" ]] || fail "missing blog/index.html in release ${sha}"
  [[ -f "${release_dir}/admin/index.html" ]] || fail "missing admin/index.html in release ${sha}"
}

switch_release() {
  switch_link "$blog_link" "${release_dir}/blog"
  switch_link "$admin_link" "${release_dir}/admin"
}

cleanup_releases() {
  local old_release
  while IFS= read -r old_release; do
    [[ -n "$old_release" ]] || continue
    [[ "$old_release" != "$release_dir" ]] || continue
    rm -rf -- "$old_release"
  done < <(
    find "$releases_dir" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
      | sort -nr \
      | awk -v keep="$keep" 'NR > keep {sub(/^[^ ]+ /, ""); print}'
  )
}

mkdir -p -- "$releases_dir" "$incoming_dir"
chmod 755 -- "$deploy_root" "$releases_dir" "$incoming_dir"

previous_blog="$(capture_link "$blog_link")"
if [[ -n "$previous_blog" ]]; then
  had_blog=1
fi

previous_admin="$(capture_link "$admin_link")"
if [[ -n "$previous_admin" ]]; then
  had_admin=1
fi

if [[ "$mode" == "deploy" ]]; then
  [[ -f "$archive" ]] || fail "release archive does not exist: $archive"

  while IFS= read -r entry; do
    [[ -n "$entry" ]] || continue
    [[ "$entry" == blog/* || "$entry" == admin/* ]] || fail "unexpected archive entry: $entry"
    [[ "$entry" != /* && "$entry" != *".."* ]] || fail "unsafe archive entry: $entry"
  done < <(tar -tzf "$archive")

  if [[ -d "$release_dir" ]]; then
    [[ "$release_dir" == "${releases_dir}/"* ]] || fail "refusing to replace unsafe release path"
    rm -rf -- "$release_dir"
  fi
  mkdir -p -- "$release_dir"
  tar -xzf "$archive" -C "$release_dir" --no-same-owner --no-same-permissions
  find "$release_dir" -type d -exec chmod 755 {} +
  find "$release_dir" -type f -exec chmod 644 {} +
  validate_release

  log "activating release ${sha}"
  if ! switch_release; then
    restore_previous_links || true
    fail "failed to activate release ${sha}"
  fi

  if ! health_check; then
    restore_previous_links || true
    fail "health check failed; previous release restored"
  fi

  cleanup_releases
  rm -f -- "$archive"
  log "release ${sha} is live"
  exit 0
fi

[[ -d "$release_dir" ]] || fail "release not found: $sha"
validate_release

log "rolling back to release ${sha}"
if ! switch_release; then
  restore_previous_links || true
  fail "failed to activate rollback release ${sha}"
fi

if ! health_check; then
  restore_previous_links || true
  fail "rollback health check failed; previous release restored"
fi

log "release ${sha} is live after rollback"
