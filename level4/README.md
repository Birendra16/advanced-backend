# Level 4 — AI Agents & RAG with LangChain

This level integrates **Large Language Models (LLMs)** into a Node.js backend. Phase 1 builds a stateful AI agent with real-time web search and conversation memory. Phase 2 implements a **Retrieval-Augmented Generation (RAG)** pipeline that answers questions from a PDF document.

---

## 📁 Structure

```
level4/
├── phase1/          # Stateful AI agent with tool-use & memory
│   ├── index.js     # LangGraph agent + Express API
│   ├── .env
│   └── package.json
│
└── phase2/          # RAG chatbot with PDF + Qdrant vector search
    ├── index.js     # RAG pipeline + Express API
    ├── knowledge.pdf# Source document for the knowledge base
    ├── .env
    └── package.json
```

---

## Phase 1 — Stateful AI Agent (LangGraph + Groq + Tavily)

A conversational AI agent built with **LangGraph** that:
- Maintains **conversation memory** across requests (via `MemorySaver`)
- Decides **when to call tools** (only for real-time queries: weather, news, web search)
- Uses **Tavily** as its web search tool
- Uses **Groq's LLaMA 3.3 70B** as the underlying LLM

### Agent Architecture

```
User Request (POST /ai)
       │
       ▼
  ┌─────────────────────────────────────────────────────┐
  │                  LangGraph State Graph               │
  │                                                      │
  │  __start__ ──▶ agent (LLM) ──▶ shouldContinue?      │
  │                    ▲               │                 │
  │                    │       ┌───────┴────────┐        │
  │                    │    tool_calls?          │        │
  │                    │    YES ──▶ tools node  │        │
  │                    │    NO  ──▶ __end__     │        │
  │                    └──────────────────────  │        │
  └─────────────────────────────────────────────────────┘
       │
       ▼
  Response (last message in state)
```

### LangGraph nodes

| Node | Role |
|------|------|
| `agent` | Invokes the LLM with system prompt + conversation history |
| `tools` | Executes any tool calls (Tavily web search) the LLM requested |

### Conditional edge — `shouldContinue`

```javascript
if (lastMessage.tool_calls.length > 0) return "tools"   // → run the tool
else                                    return "__end__"  // → done
```

### Memory

`MemorySaver` checkpoints the graph state after each step, keyed by `thread_id`. This allows the agent to remember prior messages in the same conversation:

```javascript
{ configurable: { thread_id: "user123" } }
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `@langchain/groq` | Groq LLM provider (LLaMA 3.3 70B) |
| `@langchain/langgraph` | Agent state graph, MemorySaver |
| `@langchain/tavily` | Tavily web search tool |
| `@google/genai` | Google Gemini (imported, optional) |
| `express` | HTTP server |
| `dotenv` | Env var loader |

### Environment Variables

Create `level4/phase1/.env`:

```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
GEMINI_API_KEY=your_gemini_api_key   # optional
```

### API

```
POST /ai
Body: { "input": "What is today's top news?" }
Response: { "ai:": "..." }

GET /
Response: { "message": "hello from level 4" }
```

### Running

```bash
cd level4/phase1
npm install
npm run dev
```

---

## Phase 2 — RAG Chatbot (PDF → Qdrant → Groq)

A **Retrieval-Augmented Generation** pipeline that:
1. Reads a PDF (`knowledge.pdf`) and chunks it with `RecursiveCharacterTextSplitter`
2. Embeds chunks using **Google Gemini embeddings** (`gemini-embedding-001`, 768 dimensions)
3. Stores embeddings in **Qdrant** vector database (collection: `grocery-store`)
4. At query time, performs **similarity search** to retrieve the top-5 relevant chunks
5. Passes the retrieved context to **Groq LLaMA 3.3 70B** with a strict RAG system prompt
6. The LLM answers **only from the provided context** — no hallucinations

### RAG Pipeline

```
PDF File (knowledge.pdf)
       │
       ▼
  Read buffer → PDFParse → raw text
       │
       ▼
  RecursiveCharacterTextSplitter
  (chunkSize: 1000, chunkOverlap: 200)
       │
       ▼
  GoogleGenerativeAIEmbeddings (gemini-embedding-001)
       │
       ▼
  QdrantVectorStore (collection: grocery-store)
       │
  ─────────────────────────────
  At query time:
  ─────────────────────────────
       │
  vectorStore.similaritySearch(query, 5)
       │
       ▼
  Top-5 chunks → SystemMessage context
       │
       ▼
  Groq LLaMA 3.3 70B
       │
       ▼
  JSON response { ai: "..." }
```

### System Prompt (strict RAG mode)

```
You are a RAG AI assistant.

STRICT RULES:
- Answer only from context
- Do not use outside knowledge
- If answer not found say: "I don't know from uploaded PDF."
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `@langchain/groq` | LLM provider |
| `@langchain/google-genai` | Gemini embeddings |
| `@langchain/qdrant` | Qdrant vector store adapter |
| `@langchain/textsplitters` | Document chunking |
| `@google/generative-ai` | Google AI SDK |
| `pdf-parse` | PDF text extraction |
| `express` | HTTP server |
| `dotenv` | Env var loader |

### Environment Variables

Create `level4/phase2/.env`:

```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
QDRANT_URL=http://localhost:6333   # or your Qdrant Cloud URL
```

### API

```
POST /ai
Body: { "input": "What products are available in the grocery store?" }
Response: { "ai": "..." }

GET /
Response: { "message": "hello from level 4" }
```

### Running

> **Prerequisites:**
> - A running Qdrant instance (local via Docker or Qdrant Cloud)
> - `knowledge.pdf` present in the `phase2/` directory

```bash
# Start Qdrant locally (if not using cloud)
docker run -p 6333:6333 qdrant/qdrant

cd level4/phase2
npm install
npm run dev
```

On first run, the `upload()` function will chunk and embed the PDF into Qdrant. Subsequent runs query the existing collection.

---

## Concepts Mastered in Level 4

- ✅ **LangGraph** — state graph for agentic workflows with conditional edges
- ✅ **Tool-use** — binding tools to an LLM and routing to tool nodes
- ✅ **Conversation memory** — `MemorySaver` with `thread_id` checkpointing
- ✅ **RAG** (Retrieval-Augmented Generation) — ground LLM answers in document context
- ✅ **Vector embeddings** — converting text chunks into semantic vectors
- ✅ **Qdrant vector database** — storing and similarity-searching embeddings
- ✅ **PDF ingestion pipeline** — parse → split → embed → store
- ✅ **Groq** as a fast LLM inference provider
