# Track C Progress — Reframing (Showcase intro lines + Lab hub)

- [x] C.1 — Showcase reframing (small intro lines only)
  - [x] `/monitoring` (`MonitoringPage.tsx`): add one framing line before the existing intro, e.g. "Exhibit: zero-cost observability I built — browser RUM, FastAPI middleware, synthetic E2E probes." Keep the cold-start note as-is
  - [x] `/amazon-tools` (`AmazonToolsPage.tsx`): add one framing line, e.g. "Live product demo: an opportunity-scoring suite I designed and built end-to-end." Existing tabs, calculator logic, and companion chat untouched
  - [x] `/how-this-site-works` (`HowThisSiteWorksPage.tsx`): make it the Lab hub — add explorer buttons for Amazon Seller Suite (`/amazon-tools`) and the chat observability panel alongside the existing Monitoring / Storybook / Swagger buttons
  - [x] Append tests for the new intro lines/buttons (your pages' suites; append-only in `Pages.test.tsx` and `AmazonToolsPage.test.tsx`)

## Log
- 2026-08-22: Initialized Track C branch and progress tracker.
- 2026-08-22: Completed C.1 - Added showcase framing to MonitoringPage and AmazonToolsPage; turned HowThisSiteWorksPage into the Lab hub with Amazon Seller Suite and Chat Observability explorer buttons; appended unit tests to Pages.test.tsx and AmazonToolsPage.test.tsx (all 25 test suites / 201 tests passing).
