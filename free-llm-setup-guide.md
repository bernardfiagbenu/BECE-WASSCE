# FREE LLM Setup Guide for AI Chatbot

## 🚀 Quick Setup Options (No API Key Required)

### Option 1: Hugging Face Spaces (Recommended)
1. **Visit:** https://huggingface.co/spaces
2. **Search for:** "chat" or "dialogue" models
3. **Popular Free Spaces:**
   - `microsoft/DialoGPT-medium`
   - `gpt2`
   - `chatbot`

### Option 2: Free AI APIs
1. **GitHub Zen API** (Already implemented)
   - Free, no API key needed
   - Provides motivational quotes
   - Works immediately

2. **JSONPlaceholder** (Already implemented)
   - Free test API
   - No authentication required
   - Good for testing

### Option 3: Self-Hosted Options

#### LocalAI (Free, Self-hosted)
```bash
# Install LocalAI
git clone https://github.com/go-skynet/LocalAI
cd LocalAI
docker-compose up -d

# Update ai-chatbot.js with:
const LOCALAI_URL = 'http://localhost:8080/v1/chat/completions';
```

#### Ollama (Free, Self-hosted)
```bash
# Download from ollama.ai
# Run: ollama run llama2

# Update ai-chatbot.js with:
const OLLAMA_URL = 'http://localhost:11434/api/generate';
```

## 🔧 How to Update the AI Chatbot

### Step 1: Get Free API Key (Optional)
1. Go to [huggingface.co](https://huggingface.co)
2. Create account
3. Go to Settings → Access Tokens
4. Create new token
5. Copy the token

### Step 2: Update ai-chatbot.js
Replace this line in `ai-chatbot.js`:
```javascript
'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN'
```

With your actual token:
```javascript
'Authorization': 'Bearer hf_your_actual_token_here'
```

### Step 3: Test the Chatbot
1. Open your app: `http://localhost:8000`
2. Look for the floating chat button (bottom right)
3. Click it and ask a question
4. Check browser console for any errors

## 🎯 Current Status

✅ **Working Now:**
- GitHub Zen API (motivational quotes)
- JSONPlaceholder (test responses)
- Local keyword-based responses
- Fallback system

🔄 **Ready to Add:**
- Hugging Face Spaces (when you get API key)
- LocalAI (when you install it)
- Ollama (when you install it)

## 🚨 Troubleshooting

### Chatbot Not Appearing?
1. Check if `ai-chatbot.js` is loaded
2. Open browser console (F12)
3. Look for any JavaScript errors
4. Make sure the script tag is in your HTML

### No AI Responses?
1. Check browser console for API errors
2. Verify internet connection
3. Try the fallback responses first
4. Check if APIs are accessible

### Want Better AI Responses?
1. Get a Hugging Face API key
2. Install LocalAI or Ollama locally
3. Update the configuration in `ai-chatbot.js`

## 💡 Pro Tips

1. **Start Simple:** Use the current fallback system first
2. **Test Locally:** Make sure everything works before deploying
3. **Monitor Console:** Check for errors in browser developer tools
4. **Backup Plan:** Always have fallback responses ready

## 🔗 Useful Links

- [Hugging Face Spaces](https://huggingface.co/spaces)
- [LocalAI Documentation](https://localai.io/)
- [Ollama Documentation](https://ollama.ai/)
- [Free AI APIs List](https://github.com/public-apis/public-apis)

---

**The AI chatbot will work with basic responses even without any external LLM setup!** 🎉
