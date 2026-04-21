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

## Router Type
App uses **HashRouter** — routes go after `#`. Full URL format:
```
http://localhost:3000/amatia/message-center#/view/<module>
```

## Route Map

| Module                  | Full URL                                                              |
|-------------------------|-----------------------------------------------------------------------|
| Notifications           | `http://localhost:3000/amatia/message-center#/view/notifications`     |
| Events / Tasks          | `http://localhost:3000/amatia/message-center#/view/events`            |
| Actions                 | `http://localhost:3000/amatia/message-center#/view/actions`           |
| Findings                | `http://localhost:3000/amatia/message-center#/view/findings`          |
| Inspections             | `http://localhost:3000/amatia/message-center#/view/inspections`       |
| Legal Matriz            | `http://localhost:3000/amatia/message-center#/view/LegalMatriz`       |
| Permit Manager          | `http://localhost:3000/amatia/message-center#/view/permit_manager`    |
| Ambiental Permit        | `http://localhost:3000/amatia/message-center#/view/ambiental_permit`  |
| Sanctioning Processes   | `http://localhost:3000/amatia/message-center#/view/sanctioning_processes` |

---

## Screenshot Policy

Auto-capture on failure via Playwright config:
```js
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
}
```
Failure artifacts saved to: `test/results/artifacts/<test-name>/`

Manual screenshots inside tests:
```js
await page.screenshot({ path: 'test/results/my-step.png', fullPage: false });
```

---

## Result Files per Run

Every execution generates a timestamped Markdown report in `test/results/`:

```
test/results/
├── 2026-04-21_10-30-55_results.md   ← run at 10:30:55
├── 2026-04-21_15-12-03_results.md   ← run at 15:12:03
├── 01-baseline.png
├── 02-search-tarea.png
└── artifacts/                        ← failure screenshots/video/trace
```

### Report format
```
# Test Results — 21/4/2026, 10:30:55 a. m.

Status: ✅ All passed  
Run: 14 tests — 14 passed · 0 failed

## Suite Name
✅ test name  1.9s
❌ test name  3.2s
   Error: expect(received).toBe(expected)
   📸 Screenshot: test/results/artifacts/.../test-failed-1.png

## Summary
| ✅ Passed | 13 |
| ❌ Failed |  1 |
| Total     | 14 |

## Failed Tests Detail   ← only if failures exist
### ❌ Suite › test name
  full error message + screenshot path
```

Reporter source: `test/md-reporter.js`

---

## Required Skills

See [skills/required-skills.md](skills/required-skills.md)

---

## Quick Start (for AI model)

1. Read `setup/01-prerequisites.md` → install dependencies
2. Read `setup/02-playwright-config.md` → create `playwright.config.js`
3. Read each `modules/XX-<name>/steps.md` → implement `.spec.js` test file per module
4. **Run:** `pnpm test:e2e` (generates MD report automatically)
5. **View results:** `test/results/YYYY-MM-DD_HH-mm-ss_results.md`
6. **On failure:** screenshots in `test/results/artifacts/`, run `pnpm test:e2e:report` for HTML

> ⚠️ Do NOT use `--reporter=list` CLI flag — it overrides config and skips MD reporter.
