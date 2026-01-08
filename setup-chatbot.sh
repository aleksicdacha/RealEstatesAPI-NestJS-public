#!/bin/bash

echo "🤖 Installing Chatbot Dependencies..."

# Install Google Gemini SDK in backend
cd apps/api
npm install @google/generative-ai

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📝 Next steps:"
echo "1. Get your FREE Gemini API key from: https://makersuite.google.com/app/apikey"
echo "2. Add to apps/api/.env:"
echo "   GEMINI_API_KEY=your_api_key_here"
echo "3. Restart backend: npm run start:dev"
echo "4. Open user-web and you'll see chat button in bottom right! 🎉"
echo ""
echo "Note: Chatbot will work WITHOUT API key using fallback responses!"
