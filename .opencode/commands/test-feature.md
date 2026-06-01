---
description: Run Playwright tests for a feature
agent: build
---

Run Playwright tests filtered to a feature using grep.
Provide a grep string as $ARGUMENTS, for example: `checkout` or `Admin`.

Test output:
!`npx playwright test --grep "$ARGUMENTS"`

Summarize failures and suggest fixes.
