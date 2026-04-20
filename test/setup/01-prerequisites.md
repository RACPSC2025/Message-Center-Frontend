# 01 — Prerequisites

## Requirements

- Node.js >= 18
- npm >= 9
- App running at `http://localhost:3000/amatia/message-center`
- Valid session cookie OR credentials available in env vars

## Install Playwright

Run from project root (`c:\wamp64\www\message-center`):

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

## Environment Variables

Create file `test/.env.test`:

```env
BASE_URL=http://localhost:3000/amatia/message-center
TEST_USER=<username>
TEST_PASS=<password>
```

Load in tests via:
```js
require('dotenv').config({ path: './test/.env.test' });
```

Install dotenv:
```bash
npm install --save-dev dotenv
```

## Verify App is Running

Before running tests, confirm:
```bash
curl -I http://localhost:3000/amatia/message-center
# Expected: HTTP/1.1 200 OK
```

If app not running, start it:
```bash
npm start
```

## Directory for Test Files

All `.spec.js` test files go in `test/` alongside these `.md` docs.

Naming convention:
```
test/
├── 01-notifications.spec.js
├── 02-events-tasks.spec.js
├── 03-actions.spec.js
...
```
