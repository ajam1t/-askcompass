# Build Compass Upgrade Notes

This package upgrades the existing Ask Compass project instead of replacing it. Existing pages, page IDs, navigation behavior, and legacy scripts are preserved. The new Build Compass section is added as `#view-build` and linked from the existing navigation.

## Modified files

### index.html
- Preserved the original page structure.
- Added a new Build Compass page section.
- Added Build Compass to desktop and mobile navigation.
- Removed inline CSS and JavaScript by linking external files.

### assets/css/legacy.css
- Contains the original stylesheet content extracted from `index.html`.
- Also contains generated classes that replaced old inline `style` attributes.

### assets/js/legacy.js
- Contains the original JavaScript extracted from `index.html`.
- Existing workflows and navigation are kept intact.

### assets/js/legacy-bridge.js
- Replaces old inline click handlers with delegated event listeners.

### assets/css/build-compass.css
- New enterprise Build Compass UI styling.
- Includes left tree navigation, top bar, cards, dark mode, progress, admin, reports, and responsive layout.

### assets/js/build-compass.js
- New modular JavaScript module.
- Loads workflows, roles, and reports from JSON.
- Handles login, permissions, workflow branching, search, progress, admin forms, assets, users, and reports.

### data/workflows.json
- JSON-driven navigation tree and workflow steps.
- Includes the Payment > Retail > F4 Quality example with branching Step 38 YES to Step 39 and NO to Step 107.

### data/roles.json
- Configurable permissions for Admin, Manager, QA, Employee, and Trainer.

### data/reports.json
- Dashboard metrics and path analytics used by the Reports tab.

## How to run

Because Build Compass loads JSON files with `fetch`, open this folder through a local web server. Example:

```bash
python3 -m http.server 8000
```

Then open `index.html` from the local server.
