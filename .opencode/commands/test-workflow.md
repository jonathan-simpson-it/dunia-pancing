---
description: Run Playwright workflow tests
agent: build
---

Run the Playwright tests for a workflow.
If $ARGUMENTS is provided, treat it as a file path or CLI args.
Examples: `e2e/full-flow.spec.js` or `--grep "checkout"`.

Test output:
!`npx playwright test $ARGUMENTS`

Summarize any failures and suggest fixes.
