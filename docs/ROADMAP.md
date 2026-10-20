# Ask Compass product roadmap

Nine modules, one model: every procedure is a single structured definition that drives guided runs,
process maps, review history and analytics. Current per-feature status is in
[CAPABILITY_STATUS.md](CAPABILITY_STATUS.md); the website shows the same statuses.

## Feature families and where they live

The ideas below are common across procedure-management, SOP, workflow and digital-adoption products
(for example ProcedureFlow, Process Street, SweetProcess, Trainual, Confluence, Scribe, Tango, Whatfix,
Pipefy, Kissflow, Nintex and ServiceNow). They were collected from general public product descriptions and
have **not** been re-verified plan by plan; do not publish comparisons with named competitors without checking
their current documentation first.

| Module | Feature family | Inspired by the category of | Ask Compass page |
|---|---|---|---|
| 1 Guided work | Interactive procedures, branching, checklists, exceptions, linked procedures, resume, execution history | Visual guided procedures | `/platform/guided-procedures`, `/platform/workflow-engine` |
| 2 Workflow builder | Visual canvas, conditions, forms, sub-flows, templates, validation, simulation, versions | Repeatable checklists, no-code workflow builders | `/platform/workflow-builder`, `/platform/process-maps` |
| 3 SI Procedure Studio | Prompt- and document-to-procedure, missing-step detection, test generation, cited answers, human review | Process capture tools, AI knowledge assistants | `/platform/ai-procedure-studio` |
| 4 Knowledge hub | Search, folders and tags, source traceability, ownership, review dates, stale and duplicate detection | Wikis and knowledge bases | `/platform/knowledge-hub` |
| 5 Teams and collaboration | Workspaces, roles, invitations, comments, approvals, notifications, versions, audit | SOP lifecycle tools | `/platform/teams-collaboration` |
| 6 Analytics | Starts, completions, drop-off, branch friction, duration, feedback, freshness | Digital adoption analytics | `/platform/analytics` |
| 7 Automation | Triggers, webhooks, APIs, connected-system actions, retries, logs | Workflow automation and orchestration platforms | `/platform/automation-integrations` |
| 8 Training | Onboarding paths, assignments, quizzes, acknowledgements, completion records | Employee training platforms | `/platform/training` |
| 9 Governance | Sign-in, authorization, tenant isolation, SSO/MFA, retention, admin controls | Enterprise workflow suites | `/platform/security-governance` |

## Sequencing

Order is set by dependencies, not by how impressive a feature sounds.

1. **Foundation (blocks almost everything):** database, server runtime, sign-in, tenants, memberships, row-level
   security and isolation tests. See ARCHITECTURE.md §4–5.
2. **Persist what the demo already does:** procedures, versions, drafts, approvals, audit log and search for signed-in
   workspaces. The Studio UI already exists; it needs a server data layer.
3. **Execution records and analytics:** store runs server-side, then drop-off, restarts, duration and branch analysis.
4. **Builder upgrades:** drag-and-drop canvas, form and approval nodes, templates, test mode with sample inputs.
5. **Knowledge hub:** document upload, full-text search, review dates and stale-content alerts.
6. **Collaboration:** invitations, comments on steps, multi-person approval, email notifications.
7. **SI Procedure Studio:** document-to-draft with citations and branch tests, behind human review. Needs a model
   provider key held server-side and an evaluation set before launch.
8. **Training:** assignments, knowledge checks and acknowledgements built on existing procedures.
9. **Automation and integrations:** triggers, webhooks and the first connectors, each with retries and logs.
10. **Enterprise:** SSO, MFA, custom domains, retention policies, admin console.

Every item moves to “In development” on the website only when work has started, and to “Available” only when it is
built, tested and running in customer workspaces.

## Pricing

One plan: **$1 per user per month** (US dollars), every capability included, shown at `/pricing`. Customer
workspaces are not open yet, so the page states that nobody is billed today; billing arrives with the backend.
