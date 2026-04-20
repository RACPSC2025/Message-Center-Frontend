# Message Center — E2E Test Plan

## Base URL
```
http://localhost:3000/amatia/message-center
```

## Stack
- **Runner:** Playwright (Node.js)
- **Language:** JavaScript (CommonJS)
- **Screenshots:** Auto-capture on any test failure
- **Reports:** HTML report + JUnit XML

---

## Folder Structure

```
test/
├── README.md                          ← this file
├── setup/
│   ├── 01-prerequisites.md            ← install & env setup
│   └── 02-playwright-config.md        ← playwright.config.js steps
├── modules/
│   ├── 01-notifications/
│   │   └── steps.md
│   ├── 02-events-tasks/
│   │   └── steps.md
│   ├── 03-actions/
│   │   └── steps.md
│   ├── 04-findings/
│   │   └── steps.md
│   ├── 05-inspections/
│   │   └── steps.md
│   ├── 06-legal-matriz/
│   │   └── steps.md
│   ├── 07-permit-manager/
│   │   └── steps.md
│   ├── 08-ambiental-permit/
│   │   └── steps.md
│   └── 09-sanctioning-processes/
│       └── steps.md
└── skills/
    └── required-skills.md
```

---

## Route Map

| Module                  | URL path                                              |
|-------------------------|-------------------------------------------------------|
| Notifications           | `/amatia/message-center/view/notifications`           |
| Events / Tasks          | `/amatia/message-center/view/events`                  |
| Actions                 | `/amatia/message-center/view/actions`                 |
| Findings                | `/amatia/message-center/view/findings`                |
| Inspections             | `/amatia/message-center/view/inspections`             |
| Legal Matriz            | `/amatia/message-center/view/LegalMatriz`             |
| Permit Manager          | `/amatia/message-center/view/permit_manager`          |
| Ambiental Permit        | `/amatia/message-center/view/ambiental_permit`        |
| Sanctioning Processes   | `/amatia/message-center/view/sanctioning_processes`   |

---

## Screenshot Policy

All screenshots auto-capture on failure via Playwright config:
```js
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
}
```
Screenshots saved to: `test-results/<test-name>/screenshot.png`

---

## Required Skills

See [skills/required-skills.md](skills/required-skills.md)

---

## Quick Start (for AI model)

1. Read `setup/01-prerequisites.md` → install dependencies
2. Read `setup/02-playwright-config.md` → create `playwright.config.js`
3. Read each `modules/XX-<name>/steps.md` → implement `.spec.js` test file per module
4. Run: `npx playwright test --reporter=html`
5. On failure: screenshots in `test-results/`, open `playwright-report/index.html`
