# Phase 1 — Stateful AI Agent (LangGraph + Groq + Tavily)

A production-style AI agent built with **LangGraph** that maintains conversation memory across requests and knows when to use external tools (web search) versus when to rely on its own knowledge.

## How the Agent Works

The agent uses a **state graph** where the LLM decides at each step whether the task is done or whether it needs to call a tool.

```
POST /ai
    │
    ▼
State: { messages: [...] }
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                    LangGraph Graph                       │
│                                                          │
│  __start__ ──► agent (callLLM) ──► shouldContinue?      │
│                     ▲                    │               │
│                     │          ┌─────────┴──────────┐   │
│                     │     tool_calls?                │   │
│                     │    YES ──► tools (ToolNode)    │   │
│                     │    NO  ──► __end__             │   │
│                     └──────────────────              │   │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return last message content
```

## Files

| File | Description |
|------|-------------|
| `index.js` | Full agent implementation + Express server |
| `.env` | API keys |
| `package.json` | Dependencies |

## Key Components

### LLM — Groq LLaMA 3.3 70B
```javascript
const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 100,
    maxRetries: 2
}).bindTools(tools)
```

### Tool — Tavily Web Search
```javascript
const tool = new TavilySearch({ maxResults: 5, topic: "general" })
```
Used only when real-time information is needed (weather, news, stock prices).

### Memory — LangGraph MemorySaver
```javascript
const checkPointer = new MemorySaver()
// graph is compiled with the checkpointer
// each invocation uses a thread_id to restore state
{ configurable: { thread_id: "user123" } }
```
The agent remembers the full conversation history for a given `thread_id`.

### Conditional Routing — shouldContinue
```javascript
const shouldContinue = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1]
    return lastMessage.tool_calls.length > 0 ? "tools" : "__end__"
}
```

## System Prompt Strategy

The LLM is instructed to be conservative with tool calls:

```
Use conversation memory first.
Only use tools when the answer requires external real-time information like:
weather, news, web search, stock prices.

Do not call tools for simple conversation,
memory-based questions, greetings, or personal context.
```

This prevents unnecessary API calls and keeps responses fast for simple queries.

## Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
GEMINI_API_KEY=your_gemini_api_key   # available but optional
```

## API

### `POST /ai`
Send a message to the agent.

**Request:**
```json
{ "input": "What's the weather in Kathmandu today?" }
```

**Response:**
```json
{ "ai:": "Based on my search, Kathmandu is currently..." }
```

**Conversation memory example:**
```
POST /ai → "My name is Birendra"
POST /ai → "What is my name?"  // Agent correctly responds: "Birendra"
```

### `GET /`
Health check → `{ "message": "hello from level 4" }`

## Running

```bash
cd level4/phase1
npm install
npm run dev   # nodemon watches for changes
```

Server starts on port `5000`.

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@langchain/groq` | ^1.3.1 | Groq LLM provider |
| `@langchain/langgraph` | ^1.4.7 | State graph + MemorySaver |
| `@langchain/tavily` | ^1.2.0 | Web search tool |
| `@langchain/core` | ^1.2.1 | LangChain core primitives |
| `@langchain/google-genai` | ^2.2.0 | Gemini LLM (optional) |
| `@google/genai` | ^2.10.0 | Google GenAI SDK |
| `express` | ^5.2.1 | HTTP server |
| `dotenv` | ^17.4.2 | Env vars |
