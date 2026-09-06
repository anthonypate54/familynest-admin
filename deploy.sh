#!/bin/bash

# Deploy script for FamilyNest Admin website
# Builds the React app with the correct API URL baked in for the target
# environment, then prints upload/deploy instructions.
#
# Usage: ./deploy.sh <staging|production>
# Defaults to "production" if no argument is given.

set -e

ENVIRONMENT="${1:-production}"

case "$ENVIRONMENT" in
  staging)
    export REACT_APP_API_URL="https://staging.infamilynest.com/admin-api/api"
    ;;
  production)
    export REACT_APP_API_URL="https://admin.infamilynest.com/admin-api/api"
    ;;
  *)
    echo "❌ Unknown environment: '$ENVIRONMENT' (expected 'staging' or 'production')"
    exit 1
    ;;
esac

echo "🚀 Starting FamilyNest Admin deployment build for: $ENVIRONMENT"
echo "🔗 REACT_APP_API_URL=$REACT_APP_API_URL"
echo ""

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React app (REACT_APP_API_URL is picked up automatically by
# Create React App's build process since it's exported above)
echo "🔨 Building the React app..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
  echo "❌ Build failed! Check for errors above."
  exit 1
fi

echo "✅ Build completed successfully for $ENVIRONMENT!"
echo ""
echo "📋 Deployment Instructions:"
echo "1. On the target server, 'git pull' this repo, then re-run this same"
echo "   command there (or copy the 'frontend/build' directory over) so the"
echo "   nginx docroot picks up the new build."
echo "2. Ensure 'privacy.html' and 'terms.html' remain reachable per the"
echo "   api-infamilynest nginx config."
echo "3. Test admin login end-to-end and verify API calls succeed."
echo ""
echo "🌐 Admin console for $ENVIRONMENT will be available at:"
if [ "$ENVIRONMENT" = "staging" ]; then
  echo "   https://staging.infamilynest.com/admin/login"
else
  echo "   https://admin.infamilynest.com/admin/login"
fi
echo ""
