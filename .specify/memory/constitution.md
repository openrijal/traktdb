# Traktdb Constitution
<!-- Defines the immutable core principles and governance for the Traktdb project. -->

## Core Principles

### I. Verification-First (The "Done" Standard)
<!-- "Done" means Verified. No code is complete until it is proven to work. -->
All changes must be verified. This means unit tests for logic/utils, and manual verification steps (documented in `walkthrough.md`) for UI/Integration. We do not assume code works; we prove it. If a test cannot be written, the manual verification plan must be explicit and rigorous.

### II. Spec-Driven Development (Think Before Acting)
<!-- Perceive -> Reason -> Act -> Refine. -->
We never rush into implementation. We always start with a clear understanding of the requirements (Specifications) and a solid plan (`implementation_plan.md`). Ambiguities are resolved *before* writing code. We adhere to the PRAR cycle (Perceive, Reason, Act, Refine) defined in `GEMINI.md`.

### III. Aesthetic & UX Excellence
<!-- "Deep Dark Blue" / "Gunmetal" Theme is Law. -->
Traktdb is a premium personal media application. The user interface must be polished, responsive, and visually stunning. We strictly adhere to the defined Design System (Tailwind v4, Shadcn/Vue patterns, defined color palette). "Good enough" UI is not acceptable; it must be delightful.

### IV. Architecture & Type Safety
<!-- Strict TypeScript. Clean Separation of Concerns. -->
We maintain a strict TypeScript environment to catch errors early. We separate concerns: logic goes in services/utils, data access in strict Drizzle/SQL layers, and presentation in Vue components. We avoid "magic strings" in favor of centralized Enums and Constants.

### V. User Partnership & Transparency
<!-- We work *with* the user, not just for them. -->
We explain our thought process. We acknowledge mistakes immediately and correct them. We update documentation (`task.md`, `README.md`, `GEMINI.md`) to reflect the current reality of the codebase. We seek user approval for significant architectural changes.

## Technology Guidelines
<!-- The immutable tech stack constraints. -->

*   **Framework**: Astro (Hybrid Rendering)
*   **UI Components**: Vue.js + Shadcn/Vue
*   **Styling**: Tailwind CSS v4 (Custom "Gunmetal" Theme)
*   **Database**: PostgreSQL + Drizzle ORM
*   **Deployment**: Cloudflare Workers / Pages
*   **Language**: TypeScript (Strict)

## Governance
<!-- How we work and how this document changes. -->

1.  **Supremacy**: This Constitution and the `GEMINI.md` file are the supreme laws of the project. In case of conflict, `GEMINI.md` (Project Context) takes precedence for project-specific details, while this Constitution holds for general operating principles.
2.  **Amendments**: Changes to this Constitution require explicit User approval.
3.  **Documentation**: Every significant feature or refactor must verify that it leaves the documentation better than it found it.

**Version**: 1.0.0 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-04
