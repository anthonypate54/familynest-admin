#!/bin/bash

# Deploy script for FamilyNest Admin website
# This script builds the React app and prepares it for deployment

echo "🚀 Starting FamilyNest Admin deployment process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React app
echo "🔨 Building the React app..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
  echo "❌ Build failed! Check for errors above."
  exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Upload the contents of the 'frontend/build' directory to your web server"
echo "2. Ensure the 'privacy.html' file is accessible at 'https://infamilynest.com/privacy'"
echo "3. Test the website and verify all links work correctly"
echo ""
echo "🔗 After deployment, your privacy policy will be available at:"
echo "   https://infamilynest.com/privacy"
echo ""
echo "🌐 Your website will be available at:"
echo "   https://infamilynest.com"
echo ""

























