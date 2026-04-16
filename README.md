# Sahayak — Multilingual Voice-to-Form AI Engine

**Sahayak** (meaning *Helper*) is a professional, industrial-grade voice portal designed to bridge the digital divide for rural populations. Powered by **VaaniPay**, this system converts spoken vernacular into structured English data in real-time, enabling low-literacy users to fill out complex government subsidy and microfinance application forms with ease.

---

## 🚀 Key Features

- **🌐 Multilingual Regional Voice Support**: Speak in Hindi, Kannada, Tamil, or Telugu. The system detects the language and responds naturally in vernacular.
- **📊 Real-Time English Registry**: Regardless of the spoken language, data is extracted and recorded in standardized English in the portal registry.
- **⚡ Lazy Audio Initialization**: Complies with high-security browser policies by deferring audio context creation until explicitly requested by the user.
- **📡 Live Form Synchronization**: Powered by Server-Sent Events (SSE) and Vapi Webhooks for zero-latency UI updates during a conversation.
- **🧠 Intelligent Knowledge Access**: Integrated RAG (Retrieval-Augmented Generation) allows users to ask about complex terms (e.g., "What is Kollateral?") mid-form.

---

## 🛠 Tech Stack

### Frontend (User Interface)
- **Next.js 16** (App Router & Turbopack)
- **React 19** with Tailwind CSS 4
- **Zustand** for high-performance state management
- **Vapi Web SDK** for low-latency voice streaming

### Backend (Orchestration)
- **Node.js & Express**
- **Groq & Llama 3** (70B) for ultra-fast LLM reasoning
- **Qdrant** (Vector Database) for glossary and user memory retrieval
- **ElevenLabs** for human-like empathetic voice synthesis

---

## 🏗 Architecture

Sahayak operates as a three-tier system:
1. **The Voice Bridge**: Handled by Vapi, converting audio into tool-calls based on specific form extraction rules.
2. **The Logic Backend**: An Express server that validates incoming tool-calls and manages real-time updates via SSE.
3. **The SSE Monitor**: A React frontend that listens for form patches and renders visual feedback of the active registry filling.

---

## 💰 Free-Tier Optimization (Sovereign AI)

Unlike many voice portals, Sahayak is optimized to run on **zero-cost infrastructure**:
- **Local Embeddings**: Uses **Transformers.js** (`all-MiniLM-L6-v2`) to generate vector embeddings entirely on your local CPU. No OpenAI credits required for RAG.
- **Groq LLM**: Configured to use the Groq Llama 3 free tier for ultra-low latency response generation.
- **Docker-Ready**: Integrated `docker-compose.yml` for instant persistent vector memory with Qdrant.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v20+)
- Vapi account ([vapi.ai](https://vapi.ai))
- Groq account ([console.groq.com](https://console.groq.com))
- Docker (optional, for local Qdrant)

### 1. Repository Setup
```bash
git clone https://github.com/siri-sanjana/hackblr.git
cd hackblr
```

### 2. Backend Startup
```bash
cd backend
npm install
# Configure .env with your VAPI_API_KEY and GROQ_API_KEY
npm run seed  # Seed local glossary vectors
npm run dev
```

### 3. Frontend Startup
```bash
cd frontend
npm install
# Configure .env.local with NEXT_PUBLIC_VAPI_PUBLIC_KEY
npm run dev
```

### 4. Public Tunneling (Webhooks)
For external voice communication to reach your local backend, initialize a tunnel:
```bash
ngrok http 4000
```
Update your Vapi agent's `serverUrl` with the resulting ngrok address.

---

## 🤝 Contributing
This project is part of a social impact initiative to improve digital accessibility in rural India. Contributions to supporting more regional dialects or improving extraction accuracy are welcome.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
