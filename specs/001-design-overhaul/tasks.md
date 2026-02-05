# Tasks: Design System Overhaul

**Input**: Design documents from `/specs/001-design-overhaul/`
**Prerequisites**: spec.md (complete), clarifications recorded
**Branch**: `001-design-overhaul`

## Clarifications Applied

| Decision | Value |
|----------|-------|
| Color Palette | Stone (warm gray) + Sky (blue) + Orange |
| Component Strategy | CSS variables only (no shadcn changes) |
| Card Min Width | 160px |
| Primary/Accent | Blue primary, Orange accent |
| Container Strategy | Fluid with breakpoints |
| Theme Toggle | Manual toggle in header/navigation |
| Reduced Motion | Respect system preference |
| Browser Zoom | Natural breakpoint behavior |

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Design token foundation and project structure verification

- [x] T001 Audit current global.css for existing token structure in src/styles/global.css
- [x] T002 Create design token documentation file at specs/001-design-overhaul/design-tokens.md
- [x] T003 [P] Backup current global.css before modifications

---

## Phase 2: Foundational (Design Token System)

**Purpose**: Core design tokens that MUST be complete before ANY user story can be implemented

**CRITICAL**: No component styling work can begin until this phase is complete

- [x] T004 Define Stone gray scale (50-950) CSS custom properties in src/styles/global.css
- [x] T005 [P] Define Sky blue scale (50-950) for primary color in src/styles/global.css
- [x] T006 [P] Define Orange scale (50-950) for accent color in src/styles/global.css
- [x] T007 Define semantic color tokens (--background, --foreground, --card, --primary, --secondary, --muted, --accent, --destructive, --border, --input, --ring) in src/styles/global.css
- [x] T008 Define dark theme semantic color mappings using Stone/Sky/Orange in src/styles/global.css
- [x] T009 Define light theme semantic color mappings using Stone/Sky/Orange in src/styles/global.css
- [x] T010 [P] Define spacing scale tokens (--spacing-1 through --spacing-16) based on 4px units in src/styles/global.css
- [x] T011 [P] Define typography scale tokens (--text-xs through --text-4xl) in src/styles/global.css
- [x] T012 [P] Define border-radius scale tokens (--radius-sm, --radius-md, --radius-lg, --radius-full) in src/styles/global.css
- [x] T013 Define shadow tokens limited to 2 levels (--shadow-sm, --shadow-md) for flat design in src/styles/global.css
- [x] T014 [P] Define container max-width tokens for fluid breakpoints in src/styles/global.css
- [ ] T015 Verify all tokens render correctly in browser dev tools

**Checkpoint**: Design token foundation ready - component styling can now begin

---

## Phase 3: User Story 1 - Consistent Visual Experience (Priority: P1) MVP

**Goal**: Establish visual consistency across all pages through design token adoption

**Independent Test**: Navigate through dashboard, search, media details, profile, settings - verify identical component styling and zero hardcoded colors

### Implementation for User Story 1

- [x] T016 [US1] Replace hardcoded bg-gray-900 with bg-background in src/components/media/MediaCard.vue
- [x] T017 [P] [US1] Replace hardcoded text-gray-100 with text-foreground in src/components/media/MediaCard.vue
- [x] T018 [P] [US1] Replace hardcoded text-gray-400 with text-muted-foreground in src/components/media/MediaCard.vue
- [x] T019 [US1] Audit and update color usage in src/components/dashboard/TrendingSection.vue
- [x] T020 [P] [US1] Audit and update color usage in src/components/search/SearchResults.vue
- [x] T021 [P] [US1] Audit and update color usage in src/components/profile/ components
- [x] T022 [US1] Audit and update color usage in src/components/settings/ components
- [x] T023 [US1] Verify AppHeader uses design tokens in src/components/layout/AppHeader.vue
- [x] T024 [US1] Update any remaining hardcoded colors in src/components/auth/ components
- [x] T025 [US1] Update any remaining hardcoded colors in src/components/books/ components
- [x] T026 [P] [US1] Update any remaining hardcoded colors in src/components/podcasts/ components
- [x] T027 [US1] Run grep audit for remaining hardcoded color values (gray-*, blue-*, etc.)
- [x] T028 [US1] Fix any remaining hardcoded colors identified in audit

**Checkpoint**: All components use design tokens exclusively - visual consistency achieved

---

## Phase 4: User Story 2 - Mobile-First Responsive Experience (Priority: P1)

**Goal**: Seamless responsive adaptation with proper touch targets and no horizontal overflow

**Independent Test**: Access any page on 320px viewport, complete browse/search/add-to-watchlist actions without horizontal scroll

### Implementation for User Story 2

- [x] T029 [US2] Verify MediaGrid responsive columns (2/4/6) in src/components/media/MediaGrid.vue
- [x] T030 [US2] Ensure 160px minimum card width is enforced in grid calculations in src/components/media/MediaGrid.vue
- [x] T031 [US2] Implement fluid container max-widths per breakpoint in src/styles/global.css
- [x] T032 [P] [US2] Audit touch target sizes (44x44px minimum) for all buttons in src/components/ui/button/
- [x] T033 [P] [US2] Audit touch target sizes for navigation elements in src/components/layout/AppHeader.vue
- [x] T034 [US2] Test and fix horizontal overflow on 320px viewport across all pages
- [x] T035 [US2] Ensure header adapts properly on mobile viewports in src/components/layout/AppHeader.vue
- [x] T036 [P] [US2] Verify card title truncation works on narrow viewports in src/components/media/MediaCard.vue
- [x] T037 [US2] Add responsive padding adjustments (16px mobile, 24px tablet, 32px desktop) to main container
- [x] T038 [US2] Test all breakpoint transitions (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

**Checkpoint**: All pages fully responsive with proper touch targets - mobile experience complete

---

## Phase 5: User Story 3 - Clean Flat Design Aesthetic (Priority: P2)

**Goal**: Modern, professional flat design with minimal shadows and clear visual hierarchy

**Independent Test**: Visual inspection of key screens for flat design adherence (max 2 shadow levels, no gradients, hierarchy via color/spacing)

### Implementation for User Story 3

- [x] T039 [US3] Audit all box-shadow usage and reduce to max 2 levels across codebase
- [x] T040 [US3] Remove any gradient backgrounds (except functional image fades) from components
- [x] T041 [P] [US3] Ensure visual hierarchy uses spacing and color rather than heavy shadows in src/components/dashboard/
- [x] T042 [P] [US3] Apply flat design treatment to card components in src/components/ui/card/
- [x] T043 [US3] Verify button styles follow flat design (solid colors, minimal depth) in src/components/ui/button/
- [x] T044 [US3] Apply flat design to form inputs in src/components/ui/input/
- [x] T045 [US3] Ensure badge components use flat design in src/components/ui/badge/

**Checkpoint**: Flat design aesthetic consistently applied - modern, clean appearance achieved

---

## Phase 6: User Story 4 - Media Card Polish (Priority: P2)

**Goal**: Visually appealing media cards with proper aspect ratio, truncation, and interaction feedback

**Independent Test**: View any media grid, verify 2:3 poster aspect ratio, title truncation, hover/tap feedback, rating badge positioning

### Implementation for User Story 4

- [x] T046 [US4] Verify and enforce 2:3 aspect ratio for poster images in src/components/media/MediaCard.vue
- [x] T047 [US4] Implement title truncation with ellipsis (max 2 lines) in src/components/media/MediaCard.vue
- [x] T048 [US4] Add title tooltip on hover for truncated titles in src/components/media/MediaCard.vue
- [x] T049 [US4] Implement subtle hover state (opacity or border change) respecting flat design in src/components/media/MediaCard.vue
- [x] T050 [P] [US4] Implement reduced motion support for card transitions (check prefers-reduced-motion) in src/components/media/MediaCard.vue
- [x] T051 [US4] Ensure rating badge positioned consistently in top-right corner in src/components/media/MediaCard.vue
- [x] T052 [US4] Add image fallback placeholder for failed poster loads in src/components/media/MediaCard.vue
- [x] T053 [US4] Implement skeleton loading state matching card dimensions in src/components/media/MediaCard.vue

**Checkpoint**: Media cards polished and consistent - enhanced content presentation

---

## Phase 7: User Story 5 - Theme Mode Support (Priority: P3)

**Goal**: Light and dark theme support with system preference detection and manual toggle

**Independent Test**: Toggle system theme preference, verify TraktDB responds; use manual toggle in header; verify WCAG AA contrast in both themes

### Implementation for User Story 5

- [x] T054 [US5] Implement CSS media query for system theme preference detection (prefers-color-scheme) in src/styles/global.css
- [x] T055 [US5] Create theme toggle component with sun/moon icons in src/components/ui/ThemeToggle.vue
- [x] T056 [US5] Add theme toggle to header navigation in src/components/layout/AppHeader.vue
- [x] T057 [US5] Implement theme state persistence (localStorage) in src/stores/theme.ts or composable
- [x] T058 [US5] Ensure dark theme tokens render correctly when .dark class applied
- [x] T059 [US5] Ensure light theme tokens render correctly when .light class applied
- [x] T060 [P] [US5] Verify WCAG AA contrast compliance for dark theme text colors
- [x] T061 [P] [US5] Verify WCAG AA contrast compliance for light theme text colors
- [x] T062 [US5] Test theme switching animation (instant or fade, respecting reduced motion)
- [x] T063 [US5] Verify all components render correctly in both themes

**Checkpoint**: Full theme support with manual toggle - accessibility improved

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, validation, and final quality assurance

- [x] T064 [P] Implement consistent empty state styling across all pages
- [x] T065 [P] Implement consistent error state styling using destructive color tokens
- [x] T066 Verify loading skeleton states use design tokens
- [x] T067 Test grid layouts with odd numbers of items for spacing consistency
- [x] T068 Test very narrow viewports (280-320px) for essential function usability
- [x] T069 Run final grep audit for remaining hardcoded colors
- [x] T070 Run Lighthouse performance comparison (ensure within 100ms of baseline)
- [x] T071 Document design token usage in specs/001-design-overhaul/design-tokens.md
- [x] T072 Update component storybook/documentation if exists

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - establishes token usage patterns
- **User Story 2 (Phase 4)**: Depends on Foundational - can parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 (tokens in use) - builds on established patterns
- **User Story 4 (Phase 6)**: Depends on US1, US3 - applies polish to token-based cards
- **User Story 5 (Phase 7)**: Depends on US1 (light tokens need to be defined and used)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational (Phase 2)
    │
    ├── User Story 1 (P1) ────┬── User Story 3 (P2) ── User Story 4 (P2)
    │                         │
    └── User Story 2 (P1) ────┘
                              │
                              └── User Story 5 (P3)
                                        │
                                        └── Polish
```

### Within Each User Story

- Token-related tasks before component updates
- Audit tasks before fix tasks
- Core implementation before edge cases
- Verification after implementation

### Parallel Opportunities

**Phase 2 (Foundational)**:
- T005, T006 (color scales) can run in parallel
- T010, T011, T012 (spacing, typography, radius) can run in parallel
- T004 → T007 → T008, T009 must be sequential (semantic tokens depend on color scales)

**Phase 3 (US1)**:
- T017, T018 can run in parallel (same file, different properties)
- T020, T021 can run in parallel (different components)
- T025, T026 can run in parallel (different domains)

**Phase 4 (US2)**:
- T032, T033 can run in parallel (different components)
- T036 can run in parallel with touch target audits

**Phase 7 (US5)**:
- T060, T061 can run in parallel (different themes)

---

## Parallel Example: Phase 2 Foundation

```bash
# Launch color scales in parallel:
Task: "Define Sky blue scale (50-950) for primary color in src/styles/global.css"
Task: "Define Orange scale (50-950) for accent color in src/styles/global.css"

# Then launch spacing/typography/radius in parallel:
Task: "Define spacing scale tokens (--spacing-1 through --spacing-16)"
Task: "Define typography scale tokens (--text-xs through --text-4xl)"
Task: "Define border-radius scale tokens"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (visual consistency)
4. Complete Phase 4: User Story 2 (responsive) - can parallel with US1
5. **STOP and VALIDATE**: Test on desktop and mobile
6. Deploy/demo if ready - delivers core design improvement

### Incremental Delivery

1. Setup + Foundational → Token system ready
2. Add US1 → Test visual consistency → Deploy (visible quality improvement!)
3. Add US2 → Test mobile → Deploy (mobile users happy!)
4. Add US3 + US4 → Test flat design + cards → Deploy (polished aesthetic)
5. Add US5 → Test themes → Deploy (full feature set)
6. Polish → Final QA → Production release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **CRITICAL**: Do not modify shadcn component source files - use CSS variables only

---

## Summary

| Phase | User Story | Tasks | Parallel |
|-------|------------|-------|----------|
| 1 | Setup | 3 | 1 |
| 2 | Foundational | 12 | 7 |
| 3 | US1 - Visual Consistency | 13 | 5 |
| 4 | US2 - Responsive | 10 | 3 |
| 5 | US3 - Flat Design | 7 | 2 |
| 6 | US4 - Media Cards | 8 | 1 |
| 7 | US5 - Theme Support | 10 | 2 |
| 8 | Polish | 9 | 2 |
| **Total** | | **72** | **23** |

**MVP Scope**: Phases 1-4 (38 tasks) - delivers visual consistency + responsive
**Full Scope**: All phases (72 tasks) - complete design system overhaul
