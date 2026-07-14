# 🚀 Advanced Backend Engineering

A hands-on, progressive learning repository covering real-world backend engineering patterns — from containerizing a simple Express server all the way to building AI agents with RAG pipelines. Each **level** targets a specific domain; each **phase** inside it iterates from a basic proof-of-concept to a production-shaped architecture.

---

## 📚 Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Learning Path](#learning-path)
- [Level Summaries](#level-summaries)
  - [Level 1 — Docker & Containerization](#level-1--docker--containerization)
  - [Level 2 — Redis, Caching & Message Queues](#level-2--redis-caching--message-queues)
  - [Level 3 — Nginx, Load Balancing & Microservices](#level-3--nginx-load-balancing--microservices)
  - [Level 4 — AI Agents & RAG with LangChain](#level-4--ai-agents--rag-with-langchain)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)

---

## Overview

This monorepo is a **structured backend engineering curriculum** organised into four progressive levels. Rather than a single application, each level is a self-contained project that teaches one major backend concept through working code. Concepts build on each other: you containerise first (Level 1), then add caching and async jobs (Level 2), then scale horizontally behind a load balancer (Level 3), and finally integrate LLMs and vector search (Level 4).

---

## Repository Structure

```
advanced-backend/
├── level1/                  # Docker & Containerization
│   ├── phase1/              # Single-container Express server
│   └── phase2/              # Multi-container full-stack app (frontend + backend + Redis)
│
├── level2/                  # Redis, Rate-Limiting & BullMQ
│   └── phase1/              # Caching, OTP flow & async email queue
│
├── level3/                  # Nginx, Load Balancing & Microservices
│   ├── phase1/              # Round-robin load balancing across 3 servers
│   └── phase2/              # API Gateway + 3 microservices (auth, order, product)
│
└── level4/                  # AI Agents & RAG
    ├── phase1/              # Stateful AI agent with tool-use & conversation memory
    └── phase2/              # RAG chatbot with PDF ingestion & Qdrant vector search
```

---

## Learning Path

```
Level 1 → Learn Docker basics, write Dockerfiles, and orchestrate services with Docker Compose
    ↓
Level 2 → Integrate Redis for caching, rate limiting, and OTP; offload work via BullMQ queues
    ↓
Level 3 → Scale horizontally with Nginx load balancing; decompose a monolith into microservices
    ↓
Level 4 → Build LLM-powered agents with LangGraph; implement RAG with Qdrant vector database
```

---

## Level Summaries

### Level 1 — Docker & Containerization

| Phase | What you build | Key concept |
|-------|---------------|-------------|
| Phase 1 | A single Dockerised Express server | `Dockerfile`, `.dockerignore`, env vars |
| Phase 2 | Full-stack app (Next.js frontend + Express backend + Redis) via Docker Compose | Multi-container orchestration |

→ [Level 1 README](./level1/README.md)

---

### Level 2 — Redis, Caching & Message Queues

| Phase | What you build | Key concept |
|-------|---------------|-------------|
| Phase 1 | Express + MongoDB server with Redis caching, Redis-based rate limiter, OTP verification, and BullMQ email queue | Caching, rate-limiting, async jobs |

→ [Level 2 README](./level2/README.md)

---

### Level 3 — Nginx, Load Balancing & Microservices

| Phase | What you build | Key concept |
|-------|---------------|-------------|
| Phase 1 | Nginx reverse proxy load-balancing across 3 identical Express instances | Round-robin load balancing |
| Phase 2 | API Gateway (load-balanced) proxying to auth, order, and product microservices | Microservices architecture |

→ [Level 3 README](./level3/README.md)

---

### Level 4 — AI Agents & RAG with LangChain

| Phase | What you build | Key concept |
|-------|---------------|-------------|
| Phase 1 | Stateful AI agent (Groq LLaMA + Tavily web search + LangGraph memory) | Tool-use, conversation memory, state graphs |
| Phase 2 | RAG chatbot that ingests a PDF, embeds it via Gemini, stores vectors in Qdrant, and answers questions | Retrieval-Augmented Generation |

→ [Level 4 README](./level4/README.md)

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js (ES Modules) |
| **Web Framework** | Express.js v5 |
| **Database** | MongoDB (via Mongoose) |
| **Cache / Broker** | Redis (ioredis) |
| **Job Queue** | BullMQ |
| **Reverse Proxy / LB** | Nginx |
| **Containerisation** | Docker, Docker Compose |
| **Frontend** | Next.js |
| **AI / LLM** | LangChain, LangGraph, Groq (LLaMA 3.3), Google Gemini |
| **Vector DB** | Qdrant |
| **Web Search Tool** | Tavily |
| **PDF Parsing** | pdf-parse |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js ≥ 18 (for running services locally without Docker)
- API keys required for Level 4:
  - `GROQ_API_KEY`
  - `GEMINI_API_KEY`
  - `TAVILY_API_KEY`
  - `QDRANT_URL` (Qdrant Cloud or local instance)

---

## Getting Started

Each level/phase is fully self-contained. Navigate into the desired folder and follow its own README.

```bash
# Example: spin up Level 3 Phase 2 (full microservices stack)
cd level3/phase2
docker compose up --build
```

For levels that require environment variables, copy and fill in the relevant `.env` files before running.

---

> **Tip:** Work through the levels in order. Each one assumes you understand the concepts introduced by the previous level.
