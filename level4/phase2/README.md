# Phase 2 — RAG Chatbot (PDF → Qdrant → Groq)

A **Retrieval-Augmented Generation (RAG)** pipeline that answers questions strictly from the contents of an uploaded PDF. Embeddings are generated with Google Gemini and stored in a Qdrant vector database; at query time, the top-5 relevant chunks are retrieved and passed as context to the LLM.

## RAG Pipeline

```
                        ─── Ingestion (one-time) ───

knowledge.pdf
      │
      ▼
  fs.readFileSync() + PDFParse
      │
      ▼
  RecursiveCharacterTextSplitter
  (chunkSize: 1000, overlap: 200)
      │
      ▼
  GoogleGenerativeAIEmbeddings
  (model: gemini-embedding-001 — 768 dimensions)
      │
      ▼
  QdrantVectorStore
  (collection: "grocery-store")


                        ─── Query time (every request) ───

POST /ai { input: "..." }
      │
      ▼
  vectorStore.similaritySearch(input, 5)
      │ returns top-5 most relevant chunks
      ▼
  Build SystemMessage with retrieved context
      │
      ▼
  Groq LLaMA 3.3 70B
  (strict RAG prompt — answer only from context)
      │
      ▼
  JSON response { ai: "..." }
```

## Files

| File | Description |
|------|-------------|
| `index.js` | RAG pipeline, vector store setup, Express routes |
| `knowledge.pdf` | The source document — all answers come from here |
| `.env` | API keys and Qdrant URL |
| `package.json` | Dependencies |

## Key Components

### Embeddings — Gemini
```javascript
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",  // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
})
```

### Vector Store — Qdrant
```javascript
const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "grocery-store",
})
```

### Text Splitter
```javascript
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,     // ~1000 characters per chunk
    chunkOverlap: 200,   // 200-char overlap to preserve context at boundaries
})
```

### LLM — Groq LLaMA 3.3 70B
```javascript
const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 100,
})
```

### Strict RAG System Prompt
```
You are a RAG AI assistant.

STRICT RULES:
- Answer only from context
- Do not use outside knowledge
- If answer not found say: "I don't know from uploaded PDF."
```

## Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
QDRANT_URL=http://localhost:6333   # or Qdrant Cloud URL
```

## API

### `POST /ai`
Ask a question about the PDF contents.

**Request:**
```json
{ "input": "What products are in the grocery store?" }
```

**Response (answer found):**
```json
{ "ai": "The grocery store carries fresh produce including..." }
```

**Response (answer not found in PDF):**
```json
{ "ai": "I don't know from uploaded PDF." }
```

### `GET /`
Health check → `{ "message": "hello from level 4" }`

## Running

### 1. Start Qdrant

**Local:**
```bash
docker run -p 6333:6333 qdrant/qdrant
```

**Cloud:** Sign up at [qdrant.tech](https://qdrant.tech) and get a cluster URL.

### 2. Add your PDF

Place your source document at `level4/phase2/knowledge.pdf`.

### 3. Start the server

```bash
cd level4/phase2
npm install
npm run dev
```

> On **first startup**, the `upload()` function runs automatically to ingest the PDF into Qdrant. This may take a few seconds. On subsequent runs the collection already exists and ingestion is skipped.

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@langchain/groq` | ^1.3.1 | Groq LLM provider |
| `@langchain/google-genai` | ^2.2.0 | Gemini embeddings |
| `@langchain/qdrant` | ^1.0.3 | Qdrant vector store adapter |
| `@langchain/textsplitters` | ^1.0.1 | RecursiveCharacterTextSplitter |
| `@langchain/core` | ^1.2.1 | LangChain core messages |
| `@google/generative-ai` | ^0.24.1 | TaskType enum |
| `pdf-parse` | ^2.4.5 | PDF text extraction |
| `express` | ^5.2.1 | HTTP server |
| `dotenv` | ^17.4.2 | Env vars |

## RAG vs. Agent (Phase 1 vs Phase 2)

| Feature | Phase 1 (Agent) | Phase 2 (RAG) |
|---------|----------------|---------------|
| Knowledge source | LLM training + web search | Uploaded PDF only |
| Real-time data | ✅ Tavily search | ❌ Static document |
| Memory | ✅ Conversation history | ❌ Stateless |
| Hallucination risk | Low (tools ground it) | Very low (strict RAG prompt) |
| Use case | General-purpose assistant | Domain-specific Q&A |
