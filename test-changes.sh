#!/bin/bash
# Quick test script to verify changes and start local server

echo "🔍 Checking for changes..."
echo ""

# Check button styles
echo "✓ Checking button gradient style..."
if grep -q "background: linear-gradient(135deg, #D4AF37, #E5C158)" index.html; then
    echo "  ✅ Button styles updated correctly"
else
    echo "  ❌ Button styles NOT found"
fi

# Check podcast section
echo ""
echo "✓ Checking podcast player..."
if grep -q "about-podcast" index.html; then
    echo "  ✅ Podcast section added"
else
    echo "  ❌ Podcast section NOT found"
fi

# Check audio player
echo ""
echo "✓ Checking audio element..."
if grep -q "<audio controls" index.html; then
    echo "  ✅ Audio player added"
else
    echo "  ❌ Audio player NOT found"
fi

echo ""
echo "📁 Current directory: $(pwd)"
echo "📄 File size: $(ls -lh index.html | awk '{print $5}')"
echo "📅 Last modified: $(ls -lh index.html | awk '{print $6, $7, $8}')"

echo ""
echo "🌐 Starting local server on port 8000..."
echo "   Visit: http://localhost:8000"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000
