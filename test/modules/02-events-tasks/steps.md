# Module 02 — Events / Tasks

## URL
```
http://localhost:3000/amatia/message-center/view/events
```

## Source Files
- `src/features/tasks/Tasks.js`
- `src/features/tasks/DayTaskList.js`
- `src/features/tasks/UpcomingTaskList.js`
- `src/features/tasks/TaskCalender.js`
- `src/features/tasks/TaskDetailsDrawer.js`
- `src/features/MessageCenterCreateTask/` (multi-step form)

## What This Module Does
Task management. Shows task list by day and upcoming. Has calendar view. Allows creating tasks via multi-step form (Who / Why / When / Where / What steps).

---

## E2E Test Steps for AI

### Test File: `test/02-events-tasks.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Events / Tasks module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/events`);
    await page.waitForLoadState('networkidle');
  });

  // STEP 1 — page loads
  test('page renders without crash', async ({ page }) => {
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // STEP 2 — task list visible
  test('task list renders', async ({ page }) => {
    // DayTaskList or UpcomingTaskList container
    const list = page.locator('[class*="TaskList"], [class*="task-list"], [class*="DayTask"]').first();
    await expect(list).toBeVisible({ timeout: 10000 });
  });

  // STEP 3 — calendar view toggle
  test('switch to calendar view', async ({ page }) => {
    // look for calendar/view toggle button
    const calendarBtn = page.getByRole('button', { name: /calendar|calendario/i });
    if (await calendarBtn.isVisible()) {
      await calendarBtn.click();
      await expect(page.locator('[class*="Calendar"], [class*="calendar"]').first())
        .toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 4 — open create task form
  test('create task button opens multi-step form', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /crear|create|nueva|new|add|\+/i }).first();
    await createBtn.click();
    // first step of multi-step form (Who step)
    await expect(page.locator('[class*="Step"], [class*="Wizard"], [class*="Form"]').first())
      .toBeVisible({ timeout: 8000 });
  });

  // STEP 5 — navigate multi-step form
  test('multi-step form advances through steps', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /crear|create|nueva|new|add|\+/i }).first();
    await createBtn.click();
    await page.waitForSelector('[class*="Step"], [class*="Form"]');
    // Try clicking Next/Siguiente button
    const nextBtn = page.getByRole('button', { name: /next|siguiente|continue/i });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      // step 2 should be active
      await page.waitForTimeout(500);
      await expect(page.locator('[class*="Step"]').first()).toBeVisible();
    }
  });

  // STEP 6 — task details drawer opens on click
  test('clicking task opens details drawer', async ({ page }) => {
    const taskItem = page.locator('[class*="Task"], [class*="task"]').first();
    if (await taskItem.isVisible()) {
      await taskItem.click();
      await expect(page.locator('[class*="Drawer"], [class*="Dialog"]').first())
        .toBeVisible({ timeout: 8000 });
    }
  });
});
```

## Selectors to Confirm
- Task list container class
- Create/Nueva tarea button selector
- Step indicator class in multi-step form
- Drawer component class on task click

## Expected Behavior
- Task list renders (may be empty if no data)
- Calendar toggle works
- Multi-step form opens and advances
- Task click opens `TaskDetailsDrawer`
