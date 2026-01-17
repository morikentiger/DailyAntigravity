#!/bin/bash

# ==========================================
# Antigravity Daily Sync
# Purpose: Robust git push for automated posts
# ==========================================

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[$TIMESTAMP] Sync Started in $PROJECT_DIR"

# Auto-convert media (WebP -> MP4) before push
for webp in $(find . -path "*/media/*.webp"); do
    mp4="${webp%.*}.mp4"
    if [ ! -f "$mp4" ]; then
        echo "[$TIMESTAMP] Converting $webp to $mp4..."
        # WebP -> GIF -> MP4 for better compatibility
        temp_gif="${webp%.*}.gif"
        if magick "$webp" "$temp_gif" && ffmpeg -y -i "$temp_gif" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "$mp4"; then
            echo "[$TIMESTAMP] Conversion success: $mp4"
            rm "$temp_gif"
        else
            echo "[$TIMESTAMP] Conversion failed for $webp"
        fi
    fi
done

cd "$PROJECT_DIR"

# Check for changes
if [[ -z $(git status -s) ]]; then
    echo "[$TIMESTAMP] No changes to sync. skipping."
    exit 0
fi

# Sync logic
git add .
git commit -m "Auto-sync: Day $(date +%j) progress update"
if git push; then
    echo "[$TIMESTAMP] Sync Successful."
else
    echo "[$TIMESTAMP] Sync FAILED. Check network/credentials."
    exit 1
fi
