# AI LLM Setup Guide for Exam Prep Chatbot

This guide will help you set up free AI LLM services to enhance your chatbot with intelligent responses.

## 🚀 Quick Start Options

### 1. Hugging Face (Recommended - Easiest)

**Step 1: Create Account**
- Go to [https://huggingface.co/](https://huggingface.co/)
- Sign up for a free account

**Step 2: Get API Token**
- Go to Settings → Access Tokens
- Click "New token"
- Give it a name (e.g., "Exam Chatbot")
- Select "Read" permissions
- Copy the token

**Step 3: Configure**
- Open `ai-chatbot.js`
- Find line with `'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN'`
- Replace `YOUR_HUGGINGFACE_TOKEN` with your actual token

**Step 4: Test**
- The chatbot will automatically use Hugging Face models
- Free tier includes 30,000 requests per month

### 2. LocalAI (Advanced - Self-hosted)

**Step 1: Install LocalAI**
```bash
# Using Docker (recommended)
docker run -d --name localai -p 8080:8080 quay.io/go-skynet/local-ai:latest

# Or using binary
wget https://github.com/go-skynet/LocalAI/releases/download/v1.40.0/local-ai
chmod +x local-ai
./local-ai
```

**Step 2: Download Models**
```bash
# Download a model
curl http://localhost:8080/models/apply -H "Content-Type: application/json" -d '{
  "id": "gpt-3.5-turbo",
  "object": "model",
  "created": 1677610602,
  "owned_by": "openai",
  "permission": [],
  "root": "gpt-3.5-turbo",
  "parent": null,
  "spec": {
    "format": "gguf",
    "family": "llama",
    "families": ["llama", "chatml"],
    "parameter_size": "3b",
    "quantization_level": "q4_0"
  },
  "parameters": {
    "stop": ["<|endoftext|>", "Human:", "Assistant:"],
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 40,
    "repetition_penalty": 1.1,
    "mirostat": 2,
    "mirostat_tau": 5.0,
    "mirostat_eta": 0.1,
    "num_ctx": 4096,
    "num_predict": 256,
    "num_thread": 4,
    "repeat_last_n": 64,
    "repeat_penalty": 1.1,
    "seed": -1,
    "tfs_z": 1,
    "typical_p": 1,
    "use_mlock": false,
    "use_mmap": true,
    "vocab_only": false
  }
}'
```

**Step 3: Configure**
- LocalAI runs on `http://localhost:8080` by default
- The chatbot will automatically detect it

### 3. Ollama (Advanced - Self-hosted)

**Step 1: Install Ollama**
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

**Step 2: Download Model**
```bash
# Download Llama 2 (7B parameters)
ollama pull llama2

# Or download a smaller model
ollama pull llama2:7b-chat
```

**Step 3: Start Ollama**
```bash
ollama serve
```

**Step 4: Test**
```bash
ollama run llama2 "Hello, how are you?"
```

## 🎯 Free AI Models Available

### Hugging Face Models
- **microsoft/DialoGPT-medium** - Conversational AI
- **gpt2** - Text generation
- **distilbert-base-uncased** - Text classification
- **facebook/blenderbot-400M-distill** - Chatbot
- **microsoft/DialoGPT-large** - Advanced conversation

### LocalAI Models
- **gpt-3.5-turbo** - ChatGPT-like responses
- **llama2** - Meta's Llama 2
- **codellama** - Code generation
- **mistral** - Fast and efficient

### Ollama Models
- **llama2** - Meta's Llama 2
- **codellama** - Code generation
- **mistral** - Fast and efficient
- **neural-chat** - Intel's conversational model

## 🔧 Configuration Options

### Environment Variables
You can also use environment variables for configuration:

```javascript
// In ai-chatbot.js, you can add:
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN || 'YOUR_HUGGINGFACE_TOKEN';
const LOCALAI_URL = process.env.LOCALAI_URL || 'http://localhost:8080';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
```

### Custom Models
You can add custom models by modifying the `LLM_SERVICES` object:

```javascript
const LLM_SERVICES = {
    // ... existing services
    custom: {
        url: 'https://your-custom-api.com/v1/chat/completions',
        headers: {
            'Authorization': 'Bearer YOUR_CUSTOM_TOKEN',
            'Content-Type': 'application/json'
        }
    }
};
```

## 🧪 Testing Your Setup

### Test Hugging Face
```javascript
// In browser console
fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        inputs: 'Hello, how are you?'
    })
}).then(r => r.json()).then(console.log);
```

### Test LocalAI
```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Test Ollama
```bash
curl http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "Hello, how are you?"
  }'
```

## 📊 Performance Comparison

| Service | Setup Difficulty | Response Time | Quality | Cost |
|---------|------------------|---------------|---------|------|
| Hugging Face | ⭐ Easy | 2-5 seconds | ⭐⭐⭐⭐ | Free tier |
| LocalAI | ⭐⭐⭐ Medium | 1-3 seconds | ⭐⭐⭐⭐⭐ | Free |
| Ollama | ⭐⭐ Easy | 1-2 seconds | ⭐⭐⭐⭐ | Free |

## 🛠️ Troubleshooting

### Common Issues

**1. CORS Errors**
- Hugging Face API may have CORS restrictions
- Use a proxy or backend service

**2. Model Loading**
- LocalAI models take time to download
- Check logs: `docker logs localai`

**3. Memory Issues**
- Large models need significant RAM
- Use smaller models (7B instead of 13B)

**4. Network Issues**
- Check if services are running
- Verify URLs and ports

### Debug Mode
Enable debug logging in the chatbot:

```javascript
// Add to ai-chatbot.js
const DEBUG = true;

if (DEBUG) {
    console.log('LLM Service Status:', {
        huggingface: LLM_SERVICES.huggingface.headers.Authorization !== 'Bearer YOUR_HUGGINGFACE_TOKEN',
        localai: 'Check if running on localhost:8080',
        ollama: 'Check if running on localhost:11434'
    });
}
```

## 🔒 Security Considerations

1. **API Tokens**: Never commit tokens to version control
2. **Local Services**: Only run on trusted networks
3. **Rate Limiting**: Respect API limits
4. **Data Privacy**: Be aware of what data is sent to external services

## 🚀 Advanced Features

### Custom Prompts
You can customize the system prompts for better responses:

```javascript
const SYSTEM_PROMPTS = {
    study: "You are a helpful study assistant for students preparing for exams. Provide concise, helpful advice.",
    math: "You are a math tutor. Help students understand mathematical concepts step by step.",
    science: "You are a science tutor. Explain scientific concepts clearly and accurately."
};
```

### Response Filtering
Add content filtering for appropriate responses:

```javascript
function filterResponse(response) {
    const inappropriate = ['inappropriate', 'offensive', 'harmful'];
    return inappropriate.some(word => response.toLowerCase().includes(word)) 
        ? "I'm sorry, I can't provide that type of response." 
        : response;
}
```

## 📚 Additional Resources

- [Hugging Face Documentation](https://huggingface.co/docs)
- [LocalAI GitHub](https://github.com/go-skynet/LocalAI)
- [Ollama Documentation](https://ollama.ai/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 🎉 Next Steps

1. Choose your preferred LLM service
2. Follow the setup instructions
3. Test the integration
4. Customize responses as needed
5. Monitor performance and usage

The chatbot will automatically fallback to local responses if no LLM service is configured, ensuring it always works!
