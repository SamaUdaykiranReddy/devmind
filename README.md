# 🤖 DevMind Pro — Autonomous AI Debugging Platform

> **DevMind detects production errors, diagnoses root causes, generates fixes, writes BDD tests, and opens GitHub PRs — fully autonomously. Zero debugging required.**

[![npm version](https://badge.fury.io/js/devmind-sdk.svg)](https://www.npmjs.com/package/devmind-sdk)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-34.205.172.253:3002-00ffff)](http://34.205.172.253:3002)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Demo

| Service       | URL                        |
| ------------- | -------------------------- |
| Dashboard     | http://34.205.172.253:3002 |
| API           | http://34.205.172.253:3001 |
| Agent Service | http://34.205.172.253:8000 |

**Demo credentials:**

```
Email: demo@devmind.com
Password: demo123
```

---

## 🎯 What DevMind Does

```
Error happens in production at 2am
              ↓
DevMind SDK captures it instantly
              ↓
7 AI agents analyze it (LangGraph pipeline):
  Agent 1 → Anomaly Detection
  Agent 2 → Root Cause Analysis (RAG on your codebase)
  Agent 3 → Fix Generation
  Agent 4 → Unit Test Generation
  Agent 5 → BDD Test Generation (Gherkin)
  Agent 6 → Plain English Explanation
  Agent 7 → GitHub PR Creation
              ↓
Automatically:
  ✅ GitHub PR created with fix applied
  ✅ Jira bug ticket created
  ✅ Email alert sent
  ✅ Slack notification sent
  ✅ Dashboard updated
              ↓
Developer wakes up → reviews PR → merges
Bug fixed. Zero debugging required.
```

---

## ✨ Features

### 🧠 7-Agent AI Pipeline

- **Anomaly Detector** — Classifies error type and severity
- **Root Cause Analyst** — Deep analysis using RAG on your codebase
- **Fix Suggester** — Generates specific fixes referencing your actual code
- **Test Generator** — Writes Jest/Pytest unit tests
- **BDD Generator** — Creates Gherkin feature files + step definitions
- **Explainer** — Plain English explanation (What/Why/Fixed/Prevent/Learn)
- **PR Creator** — Opens GitHub PR with fix applied to your codebase

### 🔍 RAG Pipeline

- Indexes your entire codebase into Pinecone vector database
- Semantic search finds relevant code for each error
- Fixes reference your exact functions, not generic solutions
- Per-user namespaces for multi-tenant isolation

### 📊 Intelligence Layer

- **Error Grouping** — Deduplicates errors using SHA256 hashing
- **Predictive Alerts** — AI detects patterns before outages
- **Natural Language Search** — Search errors in plain English
- **Stats API** — Error trends by severity, service, time

### 🔐 Multi-Tenant Architecture

- Each user sees only their own errors
- Per-user GitHub repo connection
- Per-user Jira project configuration
- API key + JWT authentication

### 🎨 Cyberpunk Dashboard

- Real-time error feed (5s polling)
- 6-tab error cards (Root Cause, Fix, Tests, BDD, Explain, Stack)
- Severity-based glow effects (💀 Critical pulses red)
- Setup guide modal with copy-paste SDK code
- Pattern detection button

---

## 🚀 Quick Start

### Install SDK

```bash
npm install devmind-sdk
```

### Initialize in your app

```javascript
const DevMind = require("devmind-sdk");

DevMind.init({
  apiKey: "dm_live_xxxxxxxxxxxx", // from dashboard
  service: "my-app",
  apiUrl: "http://34.205.172.253:3001",
});

// That's it! All uncaught errors are now automatically:
// → Analyzed by 7 AI agents
// → Fixed with GitHub PR
// → Linked to Jira
// → Sent to Slack + Email
```

### Express Middleware

```javascript
app.use(DevMind.middleware());
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Developer App                     │
│              (devmind-sdk installed)                 │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP POST /api/analyze
┌──────────────────────▼──────────────────────────────┐
│              Node.js API (Express)                   │
│                   Port 3001                          │
│  • JWT + API key auth                                │
│  • User isolation (multi-tenant)                     │
│  • Jira integration                                  │
│  • Email + Slack alerts                              │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Python Agent Service (FastAPI)             │
│                   Port 8000                          │
│  ┌─────────────────────────────────────────────┐    │
│  │         LangGraph 7-Agent Pipeline          │    │
│  │                                             │    │
│  │  Anomaly → RootCause → Fix → Tests →        │    │
│  │  BDD → Explain → PR Creator                 │    │
│  └─────────────────────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────────────────┐     │
│  │  Pinecone    │  │      Groq LLM            │     │
│  │  RAG Index   │  │  (llama-3.1-8b-instant)  │     │
│  └──────────────┘  └──────────────────────────┘     │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  Data Layer                          │
│  PostgreSQL (analyses, users)  Redis (caching)      │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Next.js Dashboard                       │
│                   Port 3002                          │
│  • Cyberpunk terminal aesthetic                      │
│  • Real-time error feed (5s polling)                 │
│  • 6-tab error cards                                 │
│  • Multi-tenant user isolation                       │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer          | Technology                             |
| -------------- | -------------------------------------- |
| Frontend       | Next.js 15 + TypeScript + Tailwind CSS |
| Backend API    | Node.js + Express + TypeScript         |
| Agent Pipeline | Python + FastAPI + LangGraph           |
| LLM            | Groq (llama-3.1-8b-instant)            |
| RAG            | Pinecone vector database               |
| Database       | PostgreSQL + Redis                     |
| GitHub         | PyGithub + GitHub OAuth                |
| Jira           | Jira REST API v3                       |
| Email          | SendGrid                               |
| Slack          | Incoming Webhooks                      |
| SDK            | devmind-sdk (npm)                      |
| Deploy         | AWS EC2 + Docker Compose               |

---

## 📁 Project Structure

```
devmind/
├── apps/
│   ├── web/                    # Next.js dashboard
│   │   └── app/
│   │       ├── page.tsx        # Cyberpunk dashboard
│   │       ├── login/          # Login page
│   │       ├── register/       # Register page
│   │       └── components/
│   │           ├── ErrorCard.tsx
│   │           └── ErrorFeed.tsx
│   ├── api/                    # Node.js Express API
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── analyze.ts  # Main pipeline + multi-tenancy
│   │       │   ├── errors.ts   # Search + stats + predict
│   │       │   ├── github.ts   # OAuth + repo indexing
│   │       │   ├── auth.ts     # JWT auth
│   │       │   └── jira.ts     # Jira integration
│   │       └── lib/
│   │           └── notifications.ts  # Email + Slack
│   ├── agent/                  # Python FastAPI agents
│   │   ├── main.py
│   │   ├── agents/
│   │   │   ├── orchestrator.py      # LangGraph pipeline
│   │   │   ├── anomaly_detector.py
│   │   │   ├── root_cause_analyst.py
│   │   │   ├── fix_suggester.py     # RAG-powered
│   │   │   ├── test_generator.py
│   │   │   ├── bdd_generator.py
│   │   │   ├── explainer.py
│   │   │   ├── pr_creator.py
│   │   │   └── pattern_detector.py
│   │   └── rag/
│   │       ├── embedder.py
│   │       ├── retriever.py
│   │       └── repo_indexer.py
│   └── sample-app/             # Demo app
├── packages/
│   └── sdk/                    # devmind-sdk npm package
│       ├── index.js
│       ├── index.d.ts
│       └── package.json
└── docker-compose.yml
```

---

## 🚀 Self-Hosted Deployment

### Prerequisites

- Docker + Docker Compose
- Groq API key (free at console.groq.com)
- Pinecone API key (free at pinecone.io)
- GitHub Personal Access Token

### Deploy with Docker

```bash
# Clone the repo
git clone https://github.com/SamaUdaykiranReddy/devmind.git
cd devmind

# Create environment files
cp apps/api/.env.example apps/api/.env
cp apps/agent/.env.example apps/agent/.env

# Fill in your API keys
nano apps/api/.env
nano apps/agent/.env

# Launch all services
docker compose up -d

# Access dashboard
open http://localhost:3002
```

### Environment Variables

**apps/api/.env:**

```env
DATABASE_URL=postgresql://devmind:devmind@postgres:5432/devmind
AGENT_URL=http://agent:8000
JWT_SECRET=your-secret-key
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
JIRA_DOMAIN=yourorg.atlassian.net
JIRA_EMAIL=your@email.com
JIRA_API_TOKEN=your-jira-token
SENDGRID_API_KEY=your-sendgrid-key
SLACK_WEBHOOK_URL=your-slack-webhook
```

**apps/agent/.env:**

```env
GROQ_API_KEY=your-groq-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_HOST=your-pinecone-host
GITHUB_TOKEN=your-github-token
```

---

## 📊 API Reference

### Analyze Error

```http
POST /api/analyze
x-api-key: dm_live_xxxx

{
  "error": "TypeError: Cannot read properties of null",
  "stack": "at Object.<anonymous> (index.js:34:23)",
  "route": "/process",
  "service": "my-app"
}
```

### Get Errors

```http
GET /api/errors
Authorization: Bearer <jwt_token>
```

### Search Errors

```http
GET /api/errors/search?q=null pointer
Authorization: Bearer <jwt_token>
```

### Get Stats

```http
GET /api/errors/stats
Authorization: Bearer <jwt_token>
```

### Predict Patterns

```http
POST /api/errors/predict
Authorization: Bearer <jwt_token>
```

---

## 🔄 How Multi-Tenancy Works

```
Developer registers → gets unique API key (dm_live_xxxx)
                ↓
Installs devmind-sdk with their API key
                ↓
Error in their app → SDK sends with API key
                ↓
DevMind identifies user from API key
                ↓
Error saved with user_id
PR created in THEIR GitHub repo
Jira ticket in THEIR project
                ↓
Dashboard shows ONLY their errors
```

---

## 🎯 Comparison

| Feature               | Sentry   | Datadog  | DevMind     |
| --------------------- | -------- | -------- | ----------- |
| Error capture         | ✅       | ✅       | ✅          |
| Root cause analysis   | ⚠️ Basic | ⚠️ Basic | ✅ Deep RAG |
| Auto fix generation   | ❌       | ❌       | ✅          |
| GitHub PR automation  | ❌       | ❌       | ✅          |
| BDD test generation   | ❌       | ❌       | ✅          |
| Plain English explain | ❌       | ❌       | ✅          |
| Multi-agent pipeline  | ❌       | ❌       | ✅ 7 agents |
| RAG on codebase       | ❌       | ❌       | ✅          |
| Open source           | ❌       | ❌       | ✅          |
| Self-hostable         | ✅       | ❌       | ✅          |

---

## 🧑‍💻 Built By

**Udaykiran Reddy Sama**

- 🌐 [GitHub](https://github.com/SamaUdaykiranReddy)
- 💼 Agentic AI Engineer
- 📧 udaykiran333381@gmail.com

---

## 📄 License

MIT © 2026 Udaykiran Reddy Sama

---

_DevMind — Because debugging at 2am should be optional._
