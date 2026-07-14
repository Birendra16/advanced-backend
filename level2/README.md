# Level 2 — Redis, Caching & Message Queues

This level integrates **Redis** as a multi-purpose tool: a response cache, a rate-limiter store, an OTP store, and a message broker for asynchronous job processing via **BullMQ**.

---

## 📁 Structure

```
level2/
├── docker-compose.yml   # Spins up a standalone Redis instance
└── phase1/              # Express + MongoDB + Redis + BullMQ server
    ├── config/
    │   └── db.js        # MongoDB connection
    ├── lib/
    │   └── sendEmail.js # Simulated email sender (async task)
    ├── middleware/
    │   └── ratelimit.js # Redis-backed rate limiter
    ├── model/
    │   └── user.model.js# Mongoose User schema
    ├── queue.js         # BullMQ Queue definition
    ├── worker.js        # BullMQ Worker — processes email jobs
    ├── index.js         # Express server & route definitions
    └── package.json
```

---

## Phase 1 — Caching, Rate Limiting, OTP & Email Queue

A single Express + MongoDB server that demonstrates four Redis use-cases in one codebase.

### Dependencies

| Package | Role |
|---------|------|
| `express` | HTTP framework |
| `mongoose` | MongoDB ODM |
| `ioredis` | Redis client |
| `bullmq` | Job queue built on Redis |
| `dotenv` | Environment variable loader |
| `nodemon` | Development auto-reload |

### Environment Variables

Create `level2/phase1/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/level2
REDIS_URL=redis://localhost:6379
```

---

## API Endpoints

### 1. User CRUD

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/create` | Create a user in MongoDB, invalidate the Redis cache, enqueue a welcome email |
| `GET` | `/get` | Fetch all users **with Redis rate limiting** (max 5 req/min per IP) |
| `GET` | `/get-with-redis` | Fetch all users **with Redis caching** — cache key `user:all` |

**Create User flow:**
```
POST /create  →  User.create()  →  redis.del("user:all")  →  emailQueue.add()  →  201
```

**Cache flow (`/get-with-redis`):**
```
GET /get-with-redis
  └─ redis.get("user:all")
       ├─ HIT  → return cached JSON (fast path)
       └─ MISS → User.find() → redis.set("user:all") → return result
```

---

### 2. OTP Flow

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| `POST` | `/send-otp` | `{ email }` | Generate a 6-digit OTP, store in Redis with a **30-second TTL** |
| `POST` | `/verify-otp` | `{ email, otp }` | Validate OTP from Redis; delete on success |

**OTP storage key:** `otp:{email}` — expires after 30 seconds automatically.

---

### 3. Rate Limiter Middleware

File: `middleware/ratelimit.js`

Uses Redis `INCR` + `EXPIRE` to implement a **sliding window** rate limiter:

- Key: `rate-limit:{ip}`
- Window: **60 seconds**
- Limit: **5 requests per window**
- Exceeding limit → `429 Too Many Requests`

```javascript
const requests = await redis.incr(key)  // atomic increment
if (requests === 1) await redis.expire(key, 60)  // set TTL on first hit
if (requests > 5) return res.status(429).json({ message: "Too Many Requests" })
```

---

### 4. Async Email Queue (BullMQ)

**`queue.js`** — defines the `emailQueue` using BullMQ with a Redis connection.

**`worker.js`** — a separate process that listens to the queue and processes jobs:

```
User created  →  emailQueue.add("send-email", { email })
                    ↓
             Worker picks up job  →  sendEmail()  →  Job complete
```

> The worker must be run as a **separate process** alongside the main server.

```bash
# Terminal 1 — main server
node index.js

# Terminal 2 — queue worker
node worker.js
```

---

## Running Locally

### 1. Start Redis

```bash
# From level2/ root
docker compose up -d
```

### 2. Install dependencies & start the server

```bash
cd level2/phase1
npm install
npm run dev
```

### 3. Start the worker (new terminal)

```bash
cd level2/phase1
node worker.js
```

---

## Concepts Mastered in Level 2

- ✅ Redis as a **response cache** with manual invalidation on writes
- ✅ Redis as a **rate-limiter** using `INCR` + `EXPIRE`
- ✅ Redis as a **temporary key-value store** (OTP with TTL)
- ✅ **BullMQ** for decoupling long-running tasks from the HTTP request cycle
- ✅ Running a background **worker process** alongside the API server
