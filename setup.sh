#!/bin/bash
# MiniConnect Quick Start Script

echo "🎵 MiniConnect Setup"
echo "===================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 12+ first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
cd server
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the server: cd server && npm start"
echo "2. Load the extension in Chrome:"
echo "   - Go to chrome://extensions/"
echo "   - Enable Developer mode"
echo "   - Click 'Load unpacked' and select the 'extension' folder"
echo "3. Open YouTube Music in Chrome"
echo "4. On your phone, visit: http://<YOUR_LAPTOP_IP>:3000"
echo ""
echo "Happy listening! 🎧"
