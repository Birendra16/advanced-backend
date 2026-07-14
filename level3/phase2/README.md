# Phase 2 — API Gateway + Microservices Architecture

This phase evolves the Phase 1 load-balancing setup into a full **microservices architecture**. A load-balanced API Gateway proxies each request to the appropriate domain microservice based on the URL prefix.

## Architecture

```
                    ┌──────────────────────┐
Client ──── :8080 ──► Nginx (Round-Robin)  │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴────────────┐
                    ▼                       ▼
              gateway1:8000          gateway2:8000
              (express-http-proxy)   (express-http-proxy)
                    │
         ┌──────────┼──────────────┐
         ▼          ▼              ▼
   /auth route  /order route  /product route
         │          │              │
  auth-service  order-service  product-service
    :8001          :8002           :8003
```

## Directory Structure

```
phase2/
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── gateway/               # API Gateway service
│   │   ├── index.js           # Proxy routing logic
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── package.json
│   └── services/
│       ├── auth/              # Authentication microservice
│       │   ├── index.js
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── models/
│       │   ├── config/
│       │   ├── Dockerfile
│       │   └── package.json
│       ├── order/             # Order microservice
│       │   └── (same structure as auth)
│       └── product/           # Product microservice
│           └── (same structure as auth)
└── docker-compose.yml
```

## Gateway Routing

The gateway uses `express-http-proxy` to forward requests:

```javascript
// backend/gateway/index.js
app.use("/auth",    proxy("http://auth-service:8001"))
app.use("/order",   proxy("http://order-service:8002"))
app.use("/product", proxy("http://product-service:8003"))
```

The gateway strips the prefix and forwards the remainder of the path to the target service.

## Nginx Configuration

```nginx
upstream backend {
  server gateway1:8000;
  server gateway2:8000;   # Two gateway instances for HA
}

server {
  listen 80;
  location / {
    proxy_pass http://backend;
  }
}
```

## Docker Compose Services

| Service | Build | Host Port | Container Port | Role |
|---------|-------|-----------|----------------|------|
| `nginx` | official image | `8080` | `80` | Entry point / LB |
| `gateway1` | `./backend/gateway` | `7001` | `8000` | API Gateway instance 1 |
| `gateway2` | `./backend/gateway` | `7002` | `8000` | API Gateway instance 2 |
| `auth-service` | `./backend/services/auth` | `5001` | `8001` | Auth domain |
| `order-service` | `./backend/services/order` | `5002` | `8002` | Order domain |
| `product-service` | `./backend/services/product` | `5003` | `8003` | Product domain |

## Running

```bash
cd level3/phase2
docker compose up --build
```

## Testing

```bash
# Gateway health check (via Nginx)
curl http://localhost:8080/
# → { "message": "hello from 1 Gateway" } or "2 Gateway"

# Auth service (via Nginx → gateway → auth-service)
curl http://localhost:8080/auth/
# → { "message": "Hello from auth services" }

# Order service
curl http://localhost:8080/order/

# Product service
curl http://localhost:8080/product/
```

## Microservice Principles Demonstrated

| Principle | Implementation |
|-----------|---------------|
| **Single Responsibility** | Each service owns one domain (auth / order / product) |
| **Independent Deployability** | Each service has its own Dockerfile and `.env` |
| **Loose Coupling** | Services communicate only through the gateway |
| **High Availability** | Two gateway instances behind Nginx prevent a single point of failure |
| **Centralized Entry Point** | All traffic enters through one Nginx endpoint |
