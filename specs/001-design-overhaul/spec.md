# Feature Specification: Design System Overhaul

**Feature Branch**: `001-design-overhaul`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "Overall design overhaul with clean, modern flat design using shadcn tokens, responsive for mobile"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Visual Experience Across Pages (Priority: P1)

A user navigates through TraktDB - from the dashboard to search results to their profile - and experiences a cohesive, professional visual design. Colors, typography, spacing, and component styles remain consistent, building trust and reducing cognitive load.

**Why this priority**: Visual consistency is the foundation of the design system. Without it, other improvements feel fragmented. This story establishes the design token system that all other work depends on.

**Independent Test**: Can be fully tested by navigating through all main pages (dashboard, search, media details, profile, settings) and verifying visual consistency. Delivers immediate improvement to perceived quality.

**Acceptance Scenarios**:

1. **Given** a user on the dashboard, **When** they navigate to search results, **Then** card components, buttons, and text should use identical styling
2. **Given** a user viewing a media detail page, **When** they compare it to another media type (e.g., movies vs books), **Then** the visual treatment should be identical except for content-specific differences
3. **Given** any page in the application, **When** colors are inspected, **Then** all values should reference CSS custom properties (design tokens), not hardcoded values

---

### User Story 2 - Mobile-First Responsive Experience (Priority: P1)

A user accesses TraktDB on their mobile phone to check what's trending or update their watch status. The interface adapts seamlessly to the smaller screen with appropriately sized touch targets, readable text, and efficient use of screen real estate.

**Why this priority**: Mobile usage is critical for a media tracking app - users often check it while watching content or on the go. This is equally important as P1-1 and should be developed in parallel.

**Independent Test**: Can be fully tested by accessing any page on a 320px viewport and completing core actions (browse, search, add to watchlist). Delivers immediate value to mobile users.

**Acceptance Scenarios**:

1. **Given** a user on a mobile device (viewport < 640px), **When** they view the media grid, **Then** content displays in 2 columns with appropriately sized cards
2. **Given** a user on a tablet (viewport 640-1024px), **When** they view the media grid, **Then** content displays in 4 columns
3. **Given** a user on desktop (viewport > 1024px), **When** they view the media grid, **Then** content displays in 6 columns
4. **Given** any interactive element on mobile, **When** measured, **Then** the touch target is at least 44x44 pixels
5. **Given** any page on a 320px viewport, **When** scrolled horizontally, **Then** no content should overflow requiring horizontal scroll

---

### User Story 3 - Clean Flat Design Aesthetic (Priority: P2)

A user perceives TraktDB as modern and professional with a clean, uncluttered interface. The flat design approach uses solid colors, minimal shadows, and clear visual hierarchy through spacing and color rather than effects.

**Why this priority**: The aesthetic is important but builds upon the token system from P1. Once tokens are established, applying the flat design language becomes straightforward.

**Independent Test**: Can be tested by visual inspection of key screens for adherence to flat design principles (minimal shadows, no gradients, clear hierarchy). Delivers the "modern yet flat" design goal.

**Acceptance Scenarios**:

1. **Given** any component with depth indication, **When** shadows are used, **Then** a maximum of 2 shadow levels exist across the entire application
2. **Given** any colored element, **When** inspected, **Then** solid colors are used rather than gradients (except for functional image fades)
3. **Given** the visual hierarchy of any page, **When** analyzed, **Then** hierarchy is achieved through color and spacing rather than heavy shadows or effects

---

### User Story 4 - Media Card Polish (Priority: P2)

A user browses media content through well-designed cards that clearly communicate the media's poster, title, rating, and type. Cards are visually appealing and provide appropriate feedback on interaction.

**Why this priority**: Media cards are the primary content display mechanism. Polishing them amplifies the perceived quality of the entire application.

**Independent Test**: Can be tested by viewing any media grid and interacting with cards. Delivers enhanced content presentation.

**Acceptance Scenarios**:

1. **Given** a media card, **When** displayed, **Then** the poster maintains 2:3 aspect ratio without stretching or incorrect cropping
2. **Given** a media card with a long title, **When** the title would overflow, **Then** it truncates with ellipsis while remaining readable
3. **Given** a media card, **When** hovered (desktop) or tapped (mobile), **Then** subtle visual feedback is provided without breaking flat design
4. **Given** a media card with a rating, **When** displayed, **Then** the rating badge appears consistently in the top-right of the poster

---

### User Story 5 - Theme Mode Support (Priority: P3)

A user's system is set to light mode or dark mode, and TraktDB respects that preference. Both themes maintain the clean, flat aesthetic while ensuring excellent readability and contrast.

**Why this priority**: Currently dark-only. Adding light mode improves accessibility and user preference support, but the existing dark theme means this can be deferred after the foundation is solid.

**Independent Test**: Can be tested by toggling system theme preference and verifying TraktDB responds appropriately. Delivers expanded user preference support.

**Acceptance Scenarios**:

1. **Given** a user with system dark mode enabled, **When** they open TraktDB, **Then** the dark theme is displayed
2. **Given** a user with system light mode enabled, **When** they open TraktDB, **Then** the light theme is displayed
3. **Given** either theme, **When** text contrast is measured, **Then** all text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)

---

### Edge Cases

- Long media titles (>50 characters) should truncate with ellipsis and show full title on hover/tap
- Grid layouts with odd numbers of items should maintain consistent spacing without layout shifting
- Empty states (no search results, empty watchlist) should use consistent visual treatment
- Loading states should maintain visual rhythm with skeleton placeholders matching card dimensions
- Error states should be visually distinct (destructive color) yet cohesive with the design system
- Images that fail to load should display a consistent fallback placeholder
- Very narrow viewports (280-320px) should remain usable for essential functions

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define a comprehensive CSS custom property (design token) system covering colors, spacing, typography, border radius, and shadows
- **FR-002**: System MUST support both light and dark color schemes via CSS custom properties
- **FR-003**: All component colors MUST reference design token variables, not hardcoded color values
- **FR-004**: Media grids MUST adapt columns based on viewport: 2 columns (<640px), 4 columns (640-1024px), 6 columns (>1024px)
- **FR-005**: All interactive elements MUST have minimum touch target size of 44x44 pixels on mobile viewports
- **FR-006**: Typography MUST use a defined type scale with consistent sizing for headings (h1-h4), body, and caption text
- **FR-007**: Spacing MUST use a consistent scale based on 4px units (4, 8, 12, 16, 24, 32, 48, 64)
- **FR-008**: Media cards MUST maintain 2:3 aspect ratio for poster images
- **FR-009**: Long titles MUST truncate with ellipsis rather than breaking layout
- **FR-010**: System MUST use shadcn-vue components as the foundation, extended through design tokens rather than direct overrides
- **FR-011**: Shadows MUST be limited to a maximum of 2 elevation levels for flat design aesthetic
- **FR-012**: Focus states MUST be visible for keyboard navigation accessibility
- **FR-013**: Color contrast MUST meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)

### Key Entities

- **Design Token**: Centralized CSS custom property representing a visual value (color, spacing, typography). All visual styling derives from tokens.
- **Breakpoint**: Viewport width threshold that triggers responsive layout changes. Standard breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px).
- **Component Variant**: Style variation of a base component (e.g., button primary, secondary, destructive). Defined through token combinations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

| Criterion | Target | Measurement Method |
|-----------|--------|-------------------|
| Design Token Adoption | 100% of color values reference tokens | Code audit - zero hardcoded colors |
| Mobile Usability | 100% of pages usable on 320px viewport | Manual testing across all pages |
| Visual Consistency Score | Components identical across all instances | Visual regression testing |
| Touch Target Compliance | 100% of interactive elements >= 44x44px | Automated element size analysis |
| Contrast Compliance | 100% of text meets WCAG AA | Automated contrast checking |
| User Task Completion | Users complete media tracking in same or less time | Task timing comparison |
| Cross-Device Parity | Core features accessible on all devices | Feature checklist verification |
| Performance Maintenance | Page load time within 100ms of baseline | Lighthouse metrics comparison |
| Shadow Usage | Maximum 2 shadow levels in application | CSS audit for box-shadow usage |
| Theme Support | Both light and dark themes fully functional | Manual testing with system preference |

---

## Scope Definition

### In Scope
- Global CSS design token system overhaul
- Component styling updates to exclusively use design tokens
- Responsive breakpoint implementation across all pages
- Light and dark theme support with system preference detection
- Typography and spacing scale standardization
- Media card component visual refinement
- Navigation responsiveness (header adaptation, mobile-friendly)
- Existing page layout adaptation to new design system

### Out of Scope
- New features or functionality (beyond design improvements)
- Backend/API changes
- Animation/motion design system (beyond simple transitions)
- Iconography redesign
- Print stylesheets
- Third-party embed styling

---

## Dependencies

### Internal Dependencies
- Existing shadcn-vue component library (ui/ components)
- Tailwind CSS v4 configuration
- Current Vue component structure in src/components/

### External Dependencies
- None - utilizes existing technology stack

---

## Assumptions

- Tailwind CSS v4 and shadcn-vue remain the styling foundation
- Dark theme is primary; light theme is equally important for accessibility
- Target browsers: Chrome, Firefox, Safari, Edge (last 2 versions)
- Mobile targets: iOS Safari, Chrome for Android
- Vue 3 SFC component architecture will be maintained
- No performance regression is acceptable (tight budgets)
- "Flat design" means minimal shadows used only for semantic elevation, no gradients, clear hierarchy through color/spacing

---

## Appendix: Current State Analysis

### Existing Patterns (Preserve)
- Domain-driven component organization (auth, books, dashboard, media, podcasts, profile, search, settings)
- shadcn-vue ui/ component structure with CVA variants
- Tailwind CSS v4 CSS-first configuration
- Responsive grid patterns (grid-cols-2/4/6)
- Card-based media layouts with 2:3 aspect ratio
- h-14 header with minimal styling

### Issues Identified (Address)
- Hardcoded bg-gray-900, text-gray-100, text-gray-400 bypassing design tokens
- No light mode support - only dark theme tokens defined
- Inconsistent use of semantic token variables vs raw colors
- Missing sidebar and chart color tokens
- Some components mix token usage with hardcoded values

### Design Token Structure (Target)
- **Background/Foreground**: Page and text colors
- **Card**: Container backgrounds
- **Primary**: Call-to-action, active states
- **Secondary/Muted**: Subtle backgrounds, disabled states
- **Accent**: Highlights, focus indicators
- **Destructive**: Error states, delete actions
- **Border/Input**: Form and container boundaries
- **Ring**: Focus ring color
- **Radius**: Border radius scale
