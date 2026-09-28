#!/usr/bin/env bash
# Build the static export and deploy it to pointer.rohanahire.com on the VPS (ssh host "server").
# Atomic: uploads to a new release dir, then swaps the symlink Caddy serves from.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build:static
rel=$(date +%Y%m%d%H%M%S)
rsync -a --delete out/ "server:/tmp/pointer-$rel/"
ssh server "sudo mv /tmp/pointer-$rel /var/www/pointer-releases/$rel \
  && sudo chown -R root:root /var/www/pointer-releases/$rel \
  && sudo ln -sfn /var/www/pointer-releases/$rel /var/www/pointer.rohanahire.com \
  && ls -1dt /var/www/pointer-releases/* | tail -n +6 | xargs -r sudo rm -rf"
echo "Deployed $rel"
