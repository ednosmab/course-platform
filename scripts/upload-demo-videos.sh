#!/bin/bash
# Upload demo videos to Supabase Storage
# Run: bash scripts/upload-demo-videos.sh

SUPABASE_URL="https://limqrpxdzxejvuqjiwpn.supabase.co"
BUCKET="videos-demo"
VIDEOS_DIR="videos/demo"

# Check if videos exist
if [ ! -d "$VIDEOS_DIR" ]; then
  echo "❌ Videos directory not found: $VIDEOS_DIR"
  exit 1
fi

echo "📤 Uploading videos to Supabase Storage..."

for video in "$VIDEOS_DIR"/*.mp4; do
  filename=$(basename "$video")
  echo "  Uploading: $filename"
  
  # Upload via Supabase Storage REST API
  curl -s -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET/$filename" \
    -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpbXFycHhkenhlanZ1cWppd3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzA4NzQsImV4cCI6MjA5NDU0Njg3NH0.xZgIhV8toW26hc77t8r9C3HZs5m8pvKLST4NiCOn3pI" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpbXFycHhkenhlanZ1cWppd3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzA4NzQsImV4cCI6MjA5NDU0Njg3NH0.xZgIhV8toW26hc77t8r9C3HZs5m8pvKLST4NiCOn3pI" \
    -H "Content-Type: video/mp4" \
    --data-binary @"$video" 2>&1
  
  echo ""
done

echo ""
echo "✅ Upload complete!"
echo ""
echo "📎 Video URLs:"
for video in "$VIDEOS_DIR"/*.mp4; do
  filename=$(basename "$video")
  echo "  $SUPABASE_URL/storage/v1/object/public/$BUCKET/$filename"
done
