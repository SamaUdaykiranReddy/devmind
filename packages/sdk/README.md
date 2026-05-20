# devmind-sdk

> Autonomous AI debugging for Node.js apps

## Installation

```bash
npm install devmind-sdk
```

## Quick Start

```javascript
const DevMind = require("devmind-sdk");

DevMind.init({
  apiKey: "dm_live_xxxxxxxxxxxx",
  service: "my-app",
  debug: true,
});
```

## Express Middleware

```javascript
const DevMind = require("devmind-sdk");
app.use(DevMind.middleware());
```

## Manual Capture

```javascript
const DevMind = require("devmind-sdk");

try {
  await riskyOperation();
} catch (error) {
  await DevMind.capture(error, "/api/route");
}
```

## Self-Hosted

```javascript
const DevMind = require("devmind-sdk");

DevMind.init({
  apiKey: "dm_live_xxx",
  service: "my-app",
  apiUrl: "http://your-devmind-server.com",
});
```
