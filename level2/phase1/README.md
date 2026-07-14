# Phase 1 — Redis Caching, Rate Limiting, OTP & BullMQ

A single Express + MongoDB server that demonstrates **four Redis use-cases** in one project. This is the foundational phase for understanding how Redis powers caching, rate limiting, short-lived data (OTPs), and background job queues.

## Architecture

```
                         ┌─────────────────────┐
                         │    Express Server    │
                         │                     │
  Client ──── HTTP ────► │  /create            │ ──► MongoDB (write)
                         │  /get               │ ──► Redis (rate limit)
                         │  /get-with-redis    │ ──► Redis (cache read/write)
                         │  /send-otp          │ ──► Redis (OTP store)
                         │  /verify-otp        │ ──► Redis (OTP verify)
                         └────────┬────────────┘
                                  │
                             BullMQ Queue
                                  │
                         ┌────────▼────────────┐
                         │    BullMQ Worker    │
                         │   (worker.js)       │
                         │  → sendEmail()      │
                         └─────────────────────┘
```

## Project Structure

```
phase1/
├── config/
│   └── db.js            # Mongoose connection
├── lib/
│   └── sendEmail.js     # Simulated async email (5s delay)
├── middleware/
│   └── ratelimit.js     # Redis-based IP rate limiter
├── model/
│   └── user.model.js    # Mongoose User schema
├── queue.js             # BullMQ Queue setup
├── worker.js            # BullMQ Worker process
└── index.js             # Main Express server
```

## Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/level2
REDIS_URL=redis://localhost:6379
```

## API Reference

### `GET /`
Health check.

**Response:** `{ "message": "Hello from redis" }`

---

### `POST /create`
Create a new user.

**Body:**
```json
{ "name": "John", "email": "john@example.com", "password": "secret" }
```

**What happens:**
1. Invalidates Redis cache key `user:all`
2. Creates user in MongoDB
3. Adds an email job to `emailQueue` (processed asynchronously by `worker.js`)

---

### `GET /get`
Fetch all users — **rate limited** (max 5 requests per minute per IP).

**Error (429):** `{ "message": "Too Many Requests" }`

---

### `GET /get-with-redis`
Fetch all users **with Redis cache**.

- **Cache HIT** → returns instantly from Redis
- **Cache MISS** → queries MongoDB, stores result in Redis under `user:all`

---

### `POST /send-otp`
Generate and store a 6-digit OTP in Redis.

**Body:** `{ "email": "user@example.com" }`

**Response:** `{ "otp": "123456" }` *(OTP expires in 30 seconds)*

---

### `POST /verify-otp`
Verify the OTP.

**Body:** `{ "email": "user@example.com", "otp": "123456" }`

| Scenario | Status | Response |
|----------|--------|---------|
| OTP correct | 200 | `{ "message": "otp verified" }` |
| OTP wrong | 400 | `{ "message": "incorrect otp" }` |
| OTP expired / not found | 400 | `{ "message": "Otp not found or has been expired" }` |

## Running

### 1. Start Redis

```bash
# From level2/ parent folder
docker compose up -d
```

### 2. Install & start the server

```bash
npm install
npm run dev   # uses nodemon
```

### 3. Start the worker (separate terminal)

```bash
node worker.js
```

## How the Rate Limiter Works

```javascript
// middleware/ratelimit.js
const key = `rate-limit:${req.ip}`
const requests = await redis.incr(key)      // atomic increment
if (requests === 1) redis.expire(key, 60)   // set 60s TTL on first request
if (requests > 5) return 429                // reject after limit
next()
```

## How the BullMQ Queue Works

```javascript
// queue.js — producer
const emailQueue = new Queue("emailQueue", { connection })

// index.js — adding a job
await emailQueue.add("send-email", { email })

// worker.js — consumer (runs in separate process)
new Worker("emailQueue", async (job) => {
    await sendEmail(job.data.email)
}, { connection })
```
