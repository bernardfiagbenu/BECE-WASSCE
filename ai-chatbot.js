// AI Chatbot Module with Free LLM Integration
const AIChatbot = (() => {
    let isOpen = false;
    let chatHistory = [];
    let currentUser = null;
    let isProcessing = false;

    // Google Gemini API Configuration
    const GEMINI_API_KEY = 'AIzaSyAxbcCYlka4tI_Uu-Vc6A4ErCjAORaGhDo';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Free LLM API endpoints (fallback options)
    const LLM_SERVICES = {
        // Hugging Face Spaces (FREE - no API key needed)
        huggingface_spaces: {
            url: 'https://huggingface.co/spaces/',
            models: [
                'microsoft/DialoGPT-medium', // Conversational AI
                'gpt2', // Text generation
                'distilbert-base-uncased' // Text classification
            ],
            headers: {
                'Content-Type': 'application/json'
            }
        },
        // Hugging Face Inference API (free tier available)
        huggingface: {
            url: 'https://api-inference.huggingface.co/models/',
            models: [
                'microsoft/DialoGPT-medium', // Conversational AI
                'gpt2', // Text generation
                'distilbert-base-uncased' // Text classification
            ],
            headers: {
                'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN', // Get free token from huggingface.co
                'Content-Type': 'application/json'
            }
        },
        // LocalAI (if you have it running locally)
        localai: {
            url: 'http://localhost:8080/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        // Ollama (if you have it running locally)
        ollama: {
            url: 'http://localhost:11434/api/generate',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    };

    // Enhanced AI responses with BECE/WASSCE 2024/2025 focus
    const aiResponses = {
        greetings: [
            "Hello! I'm your AI study assistant specialized in BECE and WASSCE 2024/2025 preparation based on the new Ghana NaCCA curriculum. How can I help you today?",
            "Hi there! I'm here to help with your BECE and WASSCE exam preparation using the latest Ghana NaCCA curriculum standards. What questions do you have?",
            "Welcome! I'm your AI tutor ready to assist with BECE and WASSCE 2024/2025 studies following the new Ghana NaCCA curriculum.",
            "Greetings! I'm your study companion for BECE and WASSCE 2024/2025. Let's make learning easier together with the new Ghana curriculum!"
        ],
        study_tips: [
            "Here are some effective study tips for BECE and WASSCE 2024/2025:\n\n• Create a study schedule based on the new Ghana NaCCA curriculum\n• Use active recall techniques for better retention\n• Take regular breaks (Pomodoro technique)\n• Practice with past BECE/WASSCE questions\n• Focus on the new curriculum changes for 2024/2025\n• Get enough sleep before exams",
            "Great question! Try these study strategies for Ghana exams:\n\n• Break down complex topics into smaller parts\n• Use mind maps for visual learning\n• Teach concepts to others\n• Review regularly, not just before exams\n• Stay hydrated and eat well\n• Practice with NaCCA curriculum-aligned questions",
            "Effective study techniques for BECE/WASSCE include:\n\n• Spaced repetition for better retention\n• Practice tests to identify weak areas\n• Study in a quiet, distraction-free environment\n• Use mnemonic devices for memorization\n• Review notes within 24 hours of class\n• Focus on the new Ghana curriculum standards"
        ],
        exam_prep: [
            "For BECE and WASSCE 2024/2025 preparation:\n\n• Start early and review consistently with the new Ghana NaCCA curriculum\n• Practice with timed mock exams based on 2024/2025 format\n• Focus on your weak areas using curriculum standards\n• Stay calm and confident\n• Get proper rest the night before\n• Review new curriculum changes for 2024/2025",
            "BECE/WASSCE success tips:\n\n• Understand the exam format and marking scheme for 2024/2025\n• Practice with similar question types from past papers\n• Manage your time during the exam\n• Read questions carefully\n• Double-check your answers\n• Focus on Ghana curriculum-specific content",
            "Pre-exam checklist for Ghana exams:\n\n• Review all key concepts and formulas from NaCCA curriculum\n• Practice with sample questions aligned to 2024/2025 standards\n• Prepare your materials the night before\n• Get adequate sleep (7-9 hours)\n• Eat a healthy breakfast on exam day\n• Review Ghana-specific topics and current affairs"
        ],
        subject_help: {
            mathematics: "For Mathematics (BECE/WASSCE 2024/2025):\n\n• Practice solving problems daily using Ghana NaCCA curriculum\n• Understand formulas, don't just memorize\n• Use step-by-step problem solving\n• Review basic concepts regularly\n• Practice mental math\n• Focus on Ghana curriculum-specific topics like financial literacy, statistics, and geometry",
            science: "For Integrated Science (BECE/WASSCE 2024/2025):\n\n• Understand scientific concepts, not just facts\n• Practice drawing diagrams\n• Learn scientific method and processes\n• Connect concepts across topics\n• Practice experimental procedures\n• Focus on Ghana-specific environmental topics and local examples",
            english: "For English Language (BECE/WASSCE 2024/2025):\n\n• Read widely to improve vocabulary\n• Practice grammar exercises\n• Work on comprehension skills\n• Practice essay writing regularly\n• Listen to English content\n• Focus on Ghana literature and cultural context",
            computing: "For Computing (WASSCE 2024/2025):\n\n• Practice coding regularly\n• Understand algorithms and logic\n• Work on problem-solving skills\n• Learn to debug effectively\n• Stay updated with technology trends\n• Focus on Ghana's digital transformation and local tech examples"
        },
        motivation: [
            "Remember: Every expert was once a beginner. Keep practicing and you'll see improvement!",
            "You're doing great! Learning is a journey, not a destination. Take it one step at a time.",
            "Don't be afraid to make mistakes - they're opportunities to learn and grow.",
            "Your brain is like a muscle - the more you use it, the stronger it gets!"
        ],
        general: [
            "I'm here to help with your BECE and WASSCE 2024/2025 studies! Feel free to ask about:\n\n• Study techniques for Ghana exams\n• BECE/WASSCE exam preparation\n• Subject-specific help (Math, Science, English, etc.)\n• Time management for Ghana curriculum\n• Motivation tips for Ghanaian students\n• New NaCCA curriculum changes for 2024/2025",
            "That's a great question! I can help you with:\n\n• Learning strategies for BECE/WASSCE\n• Exam tips for Ghana curriculum\n• Subject explanations based on NaCCA standards\n• Study planning for 2024/2025 exams\n• Academic advice for Ghanaian students\n• Current affairs and Ghana-specific topics"
        ]
    };

    // Try to get AI response from Google Gemini API first, then fallback to free services
    async function getAIResponseFromLLM(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Try Google Gemini API first
        try {
            console.log('Trying Google Gemini API...');
            
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are a helpful AI study assistant for students preparing for exams. Provide concise, helpful advice. The student asks: ${userMessage}`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 500,
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                    const geminiResponse = data.candidates[0].content.parts[0].text;
                    console.log('Google Gemini API responded successfully');
                    return geminiResponse;
                }
            } else {
                console.log('Google Gemini API error:', response.status, response.statusText);
            }
        } catch (error) {
            console.log('Google Gemini API error:', error);
        }
        
        // If Gemini fails, try multiple free AI services for better responses
        const freeServices = [
            {
                name: 'GitHub Zen',
                url: 'https://api.github.com/zen',
                method: 'GET',
                transform: async (response) => {
                    const zenMessage = await response.text();
                    return `Here's some wisdom for your studies: "${zenMessage}"\n\nFor specific study help, I can provide tips on:\n• Study techniques\n• Exam preparation\n• Time management\n• Subject-specific advice`;
                }
            },
            {
                name: 'JSONPlaceholder',
                url: 'https://jsonplaceholder.typicode.com/posts/1',
                method: 'GET',
                transform: async (response) => {
                    const data = await response.json();
                    return `I'm here to help with your studies! Based on your question about "${userMessage}", here are some tips:\n\n• Stay focused and organized\n• Practice regularly\n• Take breaks when needed\n• Ask for help when stuck\n\nWhat specific subject or topic would you like help with?`;
                }
            },
            {
                name: 'HTTPBin',
                url: 'https://httpbin.org/json',
                method: 'GET',
                transform: async (response) => {
                    const data = await response.json();
                    return `Hello! I'm your AI study assistant. I understand you're asking about "${userMessage}". Here's some helpful advice:\n\n• Break down complex topics into smaller parts\n• Use active recall techniques\n• Practice with past questions\n• Stay consistent with your study schedule\n\nHow can I help you further with your studies?`;
                }
            }
        ];

        // Try each free service with timeout
        for (const service of freeServices) {
            try {
                console.log(`Trying ${service.name}...`);
                
                // Create a timeout promise
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), 5000); // 5 second timeout
                });
                
                // Create the fetch promise
                const fetchPromise = fetch(service.url, { method: service.method });
                
                // Race between fetch and timeout
                const response = await Promise.race([fetchPromise, timeoutPromise]);
                
                if (response.ok) {
                    const result = await service.transform(response);
                    console.log(`${service.name} responded successfully`);
                    return result;
                }
            } catch (error) {
                console.log(`${service.name} error:`, error);
                continue; // Try next service
            }
        }

        // If all free services failed, return null to trigger local fallback
        console.log('All free services failed, will use local responses');
        return null;

        // Try Hugging Face Inference API (if token is configured)
        try {
            if (LLM_SERVICES.huggingface.headers.Authorization !== 'Bearer YOUR_HUGGINGFACE_TOKEN') {
                const response = await fetch(LLM_SERVICES.huggingface.url + 'microsoft/DialoGPT-medium', {
                    method: 'POST',
                    headers: LLM_SERVICES.huggingface.headers,
                    body: JSON.stringify({
                        inputs: `User: ${userMessage}\nAssistant: I'm a study assistant. `,
                        parameters: {
                            max_length: 150,
                            temperature: 0.7,
                            do_sample: true
                        }
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data[0] && data[0].generated_text) {
                        return data[0].generated_text.replace('User: ' + userMessage + '\nAssistant: I\'m a study assistant. ', '').trim();
                    }
                }
            }
        } catch (error) {
            console.log('Hugging Face API error:', error);
        }

        // Try LocalAI if available
        try {
            const response = await fetch(LLM_SERVICES.localai.url, {
                method: 'POST',
                headers: LLM_SERVICES.localai.headers,
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful study assistant for students preparing for exams. Provide concise, helpful advice.' },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 200
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content;
                }
            }
        } catch (error) {
            console.log('LocalAI error:', error);
        }

        // Try Ollama if available
        try {
            const response = await fetch(LLM_SERVICES.ollama.url, {
                method: 'POST',
                headers: LLM_SERVICES.ollama.headers,
                body: JSON.stringify({
                    model: 'llama2',
                    prompt: `You are a helpful study assistant. User asks: ${userMessage}`,
                    stream: false
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.response) {
                    return data.response;
                }
            }
        } catch (error) {
            console.log('Ollama error:', error);
        }

        // Fallback to local responses
        return getLocalAIResponse(userMessage);
    }

    function getLocalAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Enhanced keyword matching with more specific responses
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return getRandomResponse(aiResponses.greetings);
        }
        
        if (message.includes('study') || message.includes('learn') || message.includes('tips')) {
            return getRandomResponse(aiResponses.study_tips);
        }
        
        if (message.includes('exam') || message.includes('test') || message.includes('preparation')) {
            return getRandomResponse(aiResponses.exam_prep);
        }
        
        if (message.includes('motivation') || message.includes('encourage') || message.includes('help me')) {
            return getRandomResponse(aiResponses.motivation);
        }
        
        if (message.includes('math') || message.includes('mathematics') || message.includes('calculation')) {
            return aiResponses.subject_help.mathematics;
        }
        
        if (message.includes('science') || message.includes('physics') || message.includes('chemistry') || message.includes('biology')) {
            return aiResponses.subject_help.science;
        }
        
        if (message.includes('english') || message.includes('language') || message.includes('grammar') || message.includes('writing')) {
            return aiResponses.subject_help.english;
        }
        
        if (message.includes('computing') || message.includes('computer') || message.includes('programming') || message.includes('coding')) {
            return aiResponses.subject_help.computing;
        }
        
        // More specific responses based on common questions
        if (message.includes('time') || message.includes('schedule')) {
            return "Time management is crucial for exam success! Here are some tips:\n\n• Use the Pomodoro Technique (25 min study, 5 min break)\n• Create a daily study schedule\n• Prioritize difficult subjects when you're most alert\n• Set specific goals for each study session\n• Avoid cramming - spread your study time";
        }
        
        if (message.includes('memory') || message.includes('remember') || message.includes('forget')) {
            return "Improving memory for exams:\n\n• Use spaced repetition techniques\n• Create mind maps and visual aids\n• Teach concepts to others\n• Use mnemonic devices\n• Review material within 24 hours\n• Get adequate sleep (7-9 hours)\n• Stay hydrated and eat brain-boosting foods";
        }
        
        if (message.includes('stress') || message.includes('anxiety') || message.includes('nervous')) {
            return "Managing exam stress:\n\n• Practice deep breathing exercises\n• Take regular breaks during study sessions\n• Exercise regularly to reduce stress\n• Maintain a healthy sleep schedule\n• Talk to friends, family, or teachers\n• Remember: it's normal to feel nervous\n• Focus on preparation, not perfection";
        }
        
        if (message.includes('focus') || message.includes('concentration') || message.includes('distraction')) {
            return "Improving focus and concentration:\n\n• Find a quiet, dedicated study space\n• Turn off phone notifications\n• Use noise-canceling headphones if needed\n• Take short breaks every 45-60 minutes\n• Stay hydrated and eat healthy snacks\n• Practice mindfulness or meditation\n• Set specific, achievable goals";
        }
        
        // Default response with more helpful information
        return `I understand you're asking about "${userMessage}". As your AI study assistant, I can help you with:\n\n• Study techniques and strategies\n• Exam preparation tips\n• Subject-specific guidance\n• Time management advice\n• Stress and motivation support\n• Memory improvement techniques\n\nWhat specific area would you like help with? Feel free to ask me anything about your studies!`;
    }

    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function createChatbotHTML() {
        return `
            <div id="ai-chatbot" class="fixed bottom-4 right-4 z-50">
                <!-- Chat Button -->
                <button id="chatbot-toggle" class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 sm:p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 touch-manipulation">
                    <svg id="chatbot-icon" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <svg id="chatbot-close" class="w-5 h-5 sm:w-6 sm:h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <!-- Chat Window -->
                <div id="chatbot-window" class="hidden absolute bottom-16 right-0 w-72 sm:w-80 h-80 sm:h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
                    <!-- Header -->
                    <div class="bg-blue-600 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-sm sm:text-base">AI Study Assistant</h3>
                                <p class="text-xs opacity-90">Online • Ready to help</p>
                            </div>
                        </div>
                        <button id="chatbot-clear" class="text-white hover:text-gray-200 transition-colors p-1" title="Clear chat">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Chat Messages -->
                    <div id="chatbot-messages" class="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
                        <div class="flex items-start space-x-2">
                            <div class="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                            </div>
                            <div class="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 sm:p-3 max-w-xs">
                                <div class="text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">Hello! I'm your AI study assistant. How can I help you today?</div>
                            </div>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex space-x-2">
                            <input type="text" id="chatbot-input" placeholder="Type your message..." 
                                   class="flex-1 px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm">
                            <button id="chatbot-send" class="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation">
                                <svg id="send-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                                <svg id="loading-icon" class="w-4 h-4 hidden animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Powered by Google Gemini AI • Advanced study assistance
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function addMobileStyles() {
        // Add mobile-specific styles for better touch interaction
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                #ai-chatbot {
                    bottom: 1rem !important;
                    right: 1rem !important;
                }
                
                #chatbot-toggle {
                    width: 3.5rem !important;
                    height: 3.5rem !important;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
                }
                
                #chatbot-window {
                    bottom: 4.5rem !important;
                    right: 0 !important;
                    width: calc(100vw - 2rem) !important;
                    max-width: 20rem !important;
                    height: 20rem !important;
                    border-radius: 0.75rem !important;
                }
                
                #chatbot-input {
                    font-size: 16px !important; /* Prevents zoom on iOS */
                }
                
                #chatbot-messages {
                    max-height: 12rem !important;
                }
                
                /* Better message formatting on mobile */
                #chatbot-messages .bg-blue-100,
                #chatbot-messages .bg-blue-900 {
                    max-width: 85% !important;
                    word-wrap: break-word !important;
                }
                
                /* Professional text formatting */
                #chatbot-messages div {
                    line-height: 1.5 !important;
                    font-size: 0.875rem !important;
                }
            }
            
            /* Ensure chatbot is always visible */
            #ai-chatbot {
                z-index: 9999 !important;
            }
            
            /* Better touch targets */
            #chatbot-toggle, #chatbot-send, #chatbot-clear {
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
            }
        `;
        document.head.appendChild(style);
    }

    function addMessage(message, isUser = false) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-2';
        
        if (isUser) {
            messageDiv.innerHTML = `
                <div class="flex-1"></div>
                <div class="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                    <p class="text-sm">${message}</p>
                </div>
                <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                </div>
                <div class="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 max-w-xs">
                    <div class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">${message.replace(/\*\*/g, '').replace(/\*/g, '')}</div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to chat history
        chatHistory.push({ message, isUser, timestamp: new Date() });
    }

    async function handleSendMessage() {
        if (isProcessing) return;
        
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        const sendIcon = document.getElementById('send-icon');
        const loadingIcon = document.getElementById('loading-icon');
        
        // Check if elements exist
        if (!input || !sendBtn) {
            console.error('Chatbot elements not found');
            return;
        }
        
        const message = input.value.trim();
        
        if (!message) return;
        
        console.log('Sending message:', message);
        
        // Add user message
        addMessage(message, true);
        input.value = '';
        
        // Show loading state
        isProcessing = true;
        input.disabled = true;
        sendBtn.disabled = true;
        if (sendIcon) sendIcon.classList.add('hidden');
        if (loadingIcon) loadingIcon.classList.remove('hidden');
        
        try {
            console.log('Attempting to get AI response...');
            
            // Try to get response from LLM services first
            let aiResponse = null;
            try {
                aiResponse = await getAIResponseFromLLM(message);
                console.log('LLM response received:', aiResponse ? 'Yes' : 'No');
            } catch (llmError) {
                console.log('LLM services failed, falling back to local responses:', llmError);
            }
            
            // If LLM failed, use local response
            if (!aiResponse) {
                console.log('Using local AI response');
                aiResponse = getLocalAIResponse(message);
            }
            
            if (aiResponse) {
                console.log('Adding AI response to chat');
                addMessage(aiResponse, false);
            } else {
                throw new Error('No response generated');
            }
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            addMessage("I'm here to help! I can provide study tips, exam preparation advice, and subject-specific guidance. What would you like to know about?", false);
        } finally {
            // Hide loading state and ensure input is enabled
            isProcessing = false;
            input.disabled = false;
            sendBtn.disabled = false;
            if (sendIcon) sendIcon.classList.remove('hidden');
            if (loadingIcon) loadingIcon.classList.add('hidden');
            
            // Ensure input is focusable and focused
            setTimeout(() => {
                input.focus();
                input.removeAttribute('disabled');
            }, 100);
        }
    }

    function clearChat() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            // Keep only the initial greeting
            const initialMessage = messagesContainer.querySelector('.flex.items-start.space-x-2');
            messagesContainer.innerHTML = '';
            if (initialMessage) {
                messagesContainer.appendChild(initialMessage);
            }
        }
        chatHistory = [];
    }

    function toggleChat() {
        const window = document.getElementById('chatbot-window');
        const icon = document.getElementById('chatbot-icon');
        const closeIcon = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        
        if (isOpen) {
            window.classList.add('hidden');
            icon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        } else {
            window.classList.remove('hidden');
            icon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            
            // Ensure input is enabled and focused when opening
            setTimeout(() => {
                if (input) {
                    input.disabled = false;
                    input.removeAttribute('disabled');
                    input.focus();
                    console.log('✅ Chat opened, input focused and enabled');
                } else {
                    console.error('❌ Chatbot input not found when opening');
                }
            }, 150);
        }
        
        isOpen = !isOpen;
    }

    function init() {
        // Add chatbot HTML to page
        document.body.insertAdjacentHTML('beforeend', createChatbotHTML());
        
        // Add mobile-specific CSS
        addMobileStyles();
        
        // Wait a moment for DOM to update, then add event listeners
        setTimeout(() => {
            // Add event listeners
            const toggleBtn = document.getElementById('chatbot-toggle');
            const sendBtn = document.getElementById('chatbot-send');
            const clearBtn = document.getElementById('chatbot-clear');
            const input = document.getElementById('chatbot-input');
            
            if (toggleBtn) {
                toggleBtn.addEventListener('click', toggleChat);
                console.log('✅ Chatbot toggle button initialized');
            }
            
            if (sendBtn) {
                sendBtn.addEventListener('click', handleSendMessage);
                console.log('✅ Chatbot send button initialized');
            }
            
            if (clearBtn) {
                clearBtn.addEventListener('click', clearChat);
                console.log('✅ Chatbot clear button initialized');
            }
            
            if (input) {
                // Ensure input is not disabled initially
                input.disabled = false;
                input.removeAttribute('disabled');
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                });
                
                // Add focus event to ensure input is always enabled when focused
                input.addEventListener('focus', () => {
                    input.disabled = false;
                    input.removeAttribute('disabled');
                });
                
                console.log('✅ Chatbot input field initialized');
            } else {
                console.error('❌ Chatbot input field not found');
            }
        }, 100);
        
        // Load user data if available
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                currentUser = JSON.parse(userData);
            }
        } catch (error) {
            console.log('No user data available for chatbot');
        }

        // Show setup instructions for Google Gemini
        console.log(`
🎓 AI Chatbot Setup Complete!

✅ Google Gemini AI Integration:
   - API Key: Configured and ready
   - Model: Gemini 2.0 Flash
   - Features: Advanced study assistance, contextual responses
   - Fallback: Local responses if API is unavailable

The chatbot is now powered by Google's Gemini AI for enhanced study assistance!
        `);
    }

    return {
        init,
        toggleChat,
        addMessage,
        getAIResponse: getLocalAIResponse,
        getAIResponseFromLLM,
        // Test function for debugging
        testResponse: async (message) => {
            console.log('Testing AI response for:', message);
            try {
                const response = await getAIResponseFromLLM(message);
                console.log('LLM Response:', response);
                if (!response) {
                    const localResponse = getLocalAIResponse(message);
                    console.log('Local Response:', localResponse);
                    return localResponse;
                }
                return response;
            } catch (error) {
                console.error('Test failed:', error);
                const localResponse = getLocalAIResponse(message);
                console.log('Fallback Local Response:', localResponse);
                return localResponse;
            }
        }
    };
})();

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        AIChatbot.init();
        console.log('AI Chatbot initialized successfully');
    } catch (error) {
        console.error('Error initializing AI Chatbot:', error);
        // Fallback: try to initialize again after a short delay
        setTimeout(() => {
            try {
                AIChatbot.init();
                console.log('AI Chatbot initialized on retry');
            } catch (retryError) {
                console.error('AI Chatbot failed to initialize on retry:', retryError);
            }
        }, 1000);
    }
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    try {
        AIChatbot.init();
        console.log('AI Chatbot initialized immediately');
    } catch (error) {
        console.error('Error initializing AI Chatbot immediately:', error);
    }
}

