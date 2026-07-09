# 🤖 DevMind Pro — Autonomous AI Debugging Platform

> **DevMind detects production errors, diagnoses root causes, generates fixes, writes BDD tests, and opens GitHub PRs — fully autonomously. Zero debugging required.**

[![npm version](https://badge.fury.io/js/devmind-sdk.svg)](https://www.npmjs.com/package/devmind-sdk)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-34.205.172.253:3002-00ffff)](http://34.205.172.253:3002)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Demo

| Service          | URL                                       |
| ---------------- | ----------------------------------------- |
| 🖥️ Dashboard     | http://34.205.172.253:3002                |
| 🔌 API           | http://34.205.172.253:3001                |
| 🤖 Agent Service | http://34.205.172.253:8000/health         |
| 📦 npm SDK       | https://www.npmjs.com/package/devmind-sdk |

---

## 🎯 What DevMind Does

```
Error happens in production
              ↓
DevMind SDK captures it instantly
              ↓
7 AI agents analyze it (LangGraph pipeline):
  Agent 1 → Anomaly Detection + Severity Classification
  Agent 2 → Root Cause Analysis (RAG on your codebase)
  Agent 3 → Fix Generation
  Agent 4 → Unit Test Generation (Jest/Pytest)
  Agent 5 → BDD Test Generation (Gherkin)
  Agent 6 → Plain English Explanation
  Agent 7 → GitHub PR Creation
              ↓
Automatically:
  ✅ GitHub PR created with fix applied
  ✅ Jira bug ticket created
  ✅ Email alert sent
  ✅ Slack notification sent
  ✅ Dashboard updated in real-time
              ↓
Developer wakes up → reviews PR → merges
Bug fixed. Zero manual debugging required.
```

---

## ✨ Features

### 🧠 7-Agent AI Pipeline (LangGraph)

- **Anomaly Detector** — Classifies error type and severity (critical/high/medium/low)
- **Root Cause Analyst** — Deep analysis using RAG on your actual codebase
- **Fix Suggester** — Generates specific fixes referencing your exact code
- **Test Generator** — Writes Jest/Pytest unit tests
- **BDD Generator** — Creates Gherkin feature files + JavaScript/Python step definitions
- **Explainer** — Plain English: What happened, Why, How it was fixed, How to prevent
- **PR Creator** — Opens GitHub PR with fix applied to your codebase

### 🔍 RAG Pipeline (Pinecone)

- Indexes your entire codebase into Pinecone vector database
- Semantic search finds relevant code for each error
- Fixes reference your exact functions and variable names
- Per-user namespaces for multi-tenant isolation

### 📊 Intelligence Layer

- **Error Grouping** — Deduplicates errors using SHA256 hashing
- **Occurrence Tracking** — Counts how many times each error has occurred
- **Predictive Alerts** — AI detects patterns before outages
- **Natural Language Search** — Search errors in plain English
- **Stats API** — Error trends by severity, service, and time

### 🔐 Multi-Tenant Architecture

- Each user sees only their own errors
- Per-user GitHub repo connection
- Per-user Jira project configuration
- Per-user Slack webhook and email
- API key + JWT authentication

### 🎨 Cyberpunk Dashboard

- Real-time error feed (5s auto-refresh)
- 6-tab error cards (Root Cause, Fix, Tests, BDD, Explain, Stack)
- Severity-based glow effects (💀 Critical pulses red)
- Setup guide modal with copy-paste SDK code
- Pattern detection button
- Settings page for all integrations

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
  apiKey: "dm_live_xxxxxxxxxxxx", // Get from dashboard
  service: "my-app",
  apiUrl: "http://34.205.172.253:3001",
});

// That's it! All uncaught errors are now automatically:
// → Analyzed by 7 AI agents
// → Fixed with GitHub PR
// → Linked to Jira ticket
// → Sent to Slack + Email
// → Shown on your dashboard
```

### Express Middleware (optional)

```javascript
app.use(DevMind.middleware());
```

### Manual Error Capture

```javascript
try {
  // your code
} catch (err) {
  await DevMind.capture(err, "/your-route");
}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Developer's App (any language)              │
│                 devmind-sdk installed                    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP POST /api/analyze
                         │ x-api-key: dm_live_xxxx
┌────────────────────────▼────────────────────────────────┐
│              Node.js API (Express + TypeScript)          │
│                      Port 3001                           │
│  • JWT + API key authentication                          │
│  • Multi-tenant user isolation                           │
│  • Jira REST API v3 integration                          │
│  • SendGrid email alerts                                 │
│  • Slack webhook notifications                           │
│  • Error grouping + deduplication                        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│         Python Agent Service (FastAPI + LangGraph)       │
│                      Port 8000                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │           LangGraph 7-Agent Pipeline             │   │
│  │                                                  │   │
│  │  Anomaly → RootCause → Fix → Tests →             │   │
│  │  BDD → Explain → PR Creator                      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌─────────────────┐  ┌──────────────────────────┐      │
│  │    Pinecone      │  │       Groq LLM           │      │
│  │   RAG Index      │  │  llama-3.1-8b-instant    │      │
│  │  (per-user       │  │                          │      │
│  │   namespaces)    │  └──────────────────────────┘      │
│  └─────────────────┘                                     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     Data Layer                           │
│       PostgreSQL (analyses, users)   Redis (cache)       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Next.js Dashboard (Port 3002)               │
│  • Cyberpunk terminal aesthetic                          │
│  • Real-time error feed (5s polling)                     │
│  • 6-tab error cards with AI analysis                    │
│  • Multi-tenant — each user sees only their errors       │
│  • Settings page for GitHub, Jira, Slack, Email          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer              | Technology                             |
| ------------------ | -------------------------------------- |
| Frontend           | Next.js 15 + TypeScript + Tailwind CSS |
| Backend API        | Node.js + Express + TypeScript         |
| Agent Pipeline     | Python + FastAPI + LangGraph           |
| LLM                | Groq (llama-3.1-8b-instant)            |
| RAG                | Pinecone vector database               |
| Database           | PostgreSQL 15 + Redis 7                |
| GitHub Integration | PyGithub + GitHub OAuth                |
| Jira Integration   | Jira REST API v3                       |
| Email              | SendGrid                               |
| Slack              | Incoming Webhooks                      |
| SDK                | devmind-sdk (npm)                      |
| Deployment         | AWS EC2 t3.micro + Docker Compose      |

---

## 📁 Project Structure

```
devmind/
├── docker-compose.yml          # Production Docker setup
├── README.md
├── apps/
│   ├── web/                    # Next.js dashboard
│   │   └── app/
│   │       ├── page.tsx        # Cyberpunk dashboard
│   │       ├── login/          # Login page
│   │       ├── register/       # Register page
│   │       ├── settings/       # Settings page
│   │       └── components/
│   │           ├── ErrorCard.tsx   # 6-tab error cards
│   │           └── ErrorFeed.tsx   # Real-time error list
│   ├── api/                    # Node.js Express API
│   │   └── src/
│   │       ├── index.ts        # App entry + CORS
│   │       ├── db.ts           # PostgreSQL connection
│   │       └── routes/
│   │           ├── analyze.ts  # Main pipeline + multi-tenancy
│   │           ├── errors.ts   # Search + stats + predict
│   │           ├── github.ts   # OAuth + repo indexing
│   │           ├── auth.ts     # JWT + settings
│   │           └── jira.ts     # Jira integration
│   │       └── lib/
│   │           └── notifications.ts  # Email + Slack
│   ├── agent/                  # Python FastAPI agents
│   │   ├── main.py
│   │   ├── requirements.txt
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
│   └── sample-app/             # Demo app using devmind-sdk
│       └── index.js
└── packages/
    └── sdk/                    # devmind-sdk npm package
        ├── index.js
        ├── index.d.ts
        └── package.json
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
GITHUB_CALLBACK_URL=http://your-server:3001/api/github/callback
FRONTEND_URL=http://your-server:3002
JIRA_DOMAIN=yourorg.atlassian.net
JIRA_EMAIL=your@email.com
JIRA_API_TOKEN=your-jira-token
SENDGRID_API_KEY=your-sendgrid-key
SLACK_WEBHOOK_URL=your-slack-webhook
FROM_EMAIL=your@email.com
TO_EMAIL=your@email.com
```

**apps/agent/.env:**

```env
GROQ_API_KEY=your-groq-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_HOST=your-pinecone-host
PINECONE_INDEX=devmind
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
DATABASE_URL=postgresql://devmind:devmind@postgres:5432/devmind
REDIS_URL=redis://redis:6379
```

---

## 📊 API Reference

### Analyze Error

```http
POST /api/analyze
x-api-key: dm_live_xxxx
Content-Type: application/json

{
  "error": "TypeError: Cannot read properties of null",
  "stack": "at Object.<anonymous> (index.js:34:23)",
  "route": "/process",
  "service": "my-app"
}
```

### Get Errors (filtered by user)

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

### Update Error Status

```http
PATCH /api/analyze/:id/status
Content-Type: application/json

{ "status": "resolved" }
```

---

## 🔄 Multi-Tenancy

```
Developer registers → gets unique API key (dm_live_xxxx)
                ↓
Installs devmind-sdk with their API key
                ↓
Error in their app → SDK sends with API key header
                ↓
DevMind identifies user from API key
                ↓
Error saved with user_id
PR created in THEIR GitHub repo
Jira ticket in THEIR Jira project
Alerts sent to THEIR Slack + Email
                ↓
Dashboard shows ONLY their errors
Stats filtered to their data only
```

---

## 🎯 DevMind vs Traditional Tools

| Feature                   | Sentry   | Datadog  | DevMind        |
| ------------------------- | -------- | -------- | -------------- |
| Error capture             | ✅       | ✅       | ✅             |
| Root cause analysis       | ⚠️ Basic | ⚠️ Basic | ✅ RAG-powered |
| Auto fix generation       | ❌       | ❌       | ✅             |
| GitHub PR automation      | ❌       | ❌       | ✅             |
| BDD test generation       | ❌       | ❌       | ✅             |
| Plain English explanation | ❌       | ❌       | ✅             |
| 7-agent AI pipeline       | ❌       | ❌       | ✅             |
| RAG on your codebase      | ❌       | ❌       | ✅             |
| Self-hostable             | ✅       | ❌       | ✅             |
| Open source               | ❌       | ❌       | ✅             |
| Multi-tenant              | ✅       | ✅       | ✅             |

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
