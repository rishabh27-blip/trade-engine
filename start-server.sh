#!/bin/bash

# Quick Start Script for Trade Decision Engine PWA
# This script starts a local web server for testing

echo "=================================================="
echo "  Trade Decision Engine PWA - Local Server"
echo "=================================================="
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo "🚀 Starting server on http://localhost:8000"
    echo ""
    echo "📱 To install on your phone:"
    echo "   1. Find your computer's local IP address"
    echo "   2. Open http://YOUR_IP:8000 on your phone"
    echo "   3. Follow the installation instructions"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=================================================="
    cd "$(dirname "$0")"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Python 2 found"
    echo "🚀 Starting server on http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=================================================="
    cd "$(dirname "$0")"
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found"
    echo ""
    echo "Please install Python or use one of these alternatives:"
    echo ""
    echo "Option 1: Use Node.js"
    echo "  npm install -g http-server"
    echo "  http-server -p 8000"
    echo ""
    echo "Option 2: Use PHP"
    echo "  php -S localhost:8000"
    echo ""
    echo "Option 3: Deploy to free hosting"
    echo "  - GitHub Pages: https://pages.github.com"
    echo "  - Netlify: https://netlify.com"
    echo "  - Vercel: https://vercel.com"
    echo ""
fi
