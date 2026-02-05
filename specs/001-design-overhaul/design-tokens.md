# Design Tokens: TraktDB Design System

**Feature**: Design System Overhaul  
**Branch**: `001-design-overhaul`  
**Created**: 2026-02-04

## Overview

This document defines the design token system for TraktDB based on the clarified design choices:

| Decision | Value |
|----------|-------|
| **Color Palette** | Stone (warm gray) + Sky (blue) + Orange |
| **Primary Color** | Sky blue (trust, actions) |
| **Accent Color** | Orange (warmth, highlights) |
| **Component Strategy** | CSS variables only (no shadcn changes) |
| **Card Min Width** | 160px |
| **Container Strategy** | Fluid with breakpoints |

---

## Color Scales

### Stone (Warm Gray) - Base Palette

Used for backgrounds, text, and neutral elements.

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--stone-50` | 60 9% 98% | Lightest background (light theme) |
| `--stone-100` | 60 5% 96% | Light background |
| `--stone-200` | 20 6% 90% | Light borders |
| `--stone-300` | 24 6% 83% | Muted elements |
| `--stone-400` | 24 5% 64% | Muted text |
| `--stone-500` | 25 5% 45% | Secondary text |
| `--stone-600` | 33 5% 32% | Body text (light theme) |
| `--stone-700` | 30 6% 25% | Dark borders |
| `--stone-800` | 12 6% 15% | Dark background |
| `--stone-900` | 24 10% 10% | Darker background |
| `--stone-950` | 20 14% 4% | Darkest background (dark theme) |

### Sky (Blue) - Primary Action Color

Used for buttons, links, active states, and CTAs.

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--sky-50` | 204 100% 97% | Light primary background |
| `--sky-100` | 204 94% 94% | Light primary hover |
| `--sky-200` | 201 94% 86% | Light primary active |
| `--sky-300` | 199 95% 74% | Primary light |
| `--sky-400` | 198 93% 60% | Primary |
| `--sky-500` | 199 89% 48% | Primary dark |
| `--sky-600` | 200 98% 39% | Primary darker |
| `--sky-700` | 201 96% 32% | Primary on dark bg |
| `--sky-800` | 201 90% 27% | Primary darkest |
| `--sky-900` | 202 80% 24% | Primary on light bg |
| `--sky-950` | 204 80% 16% | Darkest primary |

### Orange - Accent Color

Used for ratings, favorites, notifications, and warmth accents.

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--orange-50` | 33 100% 96% | Light accent background |
| `--orange-100` | 34 100% 92% | Light accent hover |
| `--orange-200` | 32 98% 83% | Light accent active |
| `--orange-300` | 31 97% 72% | Accent light |
| `--orange-400` | 27 96% 61% | Accent |
| `--orange-500` | 25 95% 53% | Accent dark |
| `--orange-600` | 21 90% 48% | Accent darker |
| `--orange-700` | 17 88% 40% | Accent on dark bg |
| `--orange-800` | 15 79% 34% | Accent darkest |
| `--orange-900` | 15 75% 28% | Accent on light bg |
| `--orange-950` | 13 81% 15% | Darkest accent |

---

## Semantic Tokens

### Dark Theme (Default)

| Token | Maps To | Usage |
|-------|---------|-------|
| `--background` | stone-950 | Page background |
| `--foreground` | stone-50 | Primary text |
| `--card` | stone-900 | Card backgrounds |
| `--card-foreground` | stone-50 | Card text |
| `--primary` | sky-500 | Primary actions |
| `--primary-foreground` | stone-50 | Text on primary |
| `--secondary` | stone-800 | Secondary backgrounds |
| `--secondary-foreground` | stone-200 | Secondary text |
| `--muted` | stone-800 | Muted backgrounds |
| `--muted-foreground` | stone-400 | Muted text |
| `--accent` | orange-500 | Accent elements |
| `--accent-foreground` | stone-50 | Text on accent |
| `--destructive` | 0 62.8% 30.6% | Error/delete |
| `--destructive-foreground` | stone-50 | Text on destructive |
| `--border` | stone-700 | Borders |
| `--input` | stone-800 | Input backgrounds |
| `--ring` | sky-500 | Focus rings |

### Light Theme

| Token | Maps To | Usage |
|-------|---------|-------|
| `--background` | stone-50 | Page background |
| `--foreground` | stone-900 | Primary text |
| `--card` | white | Card backgrounds |
| `--card-foreground` | stone-900 | Card text |
| `--primary` | sky-600 | Primary actions |
| `--primary-foreground` | white | Text on primary |
| `--secondary` | stone-100 | Secondary backgrounds |
| `--secondary-foreground` | stone-700 | Secondary text |
| `--muted` | stone-100 | Muted backgrounds |
| `--muted-foreground` | stone-500 | Muted text |
| `--accent` | orange-500 | Accent elements |
| `--accent-foreground` | white | Text on accent |
| `--destructive` | 0 84% 60% | Error/delete |
| `--destructive-foreground` | white | Text on destructive |
| `--border` | stone-200 | Borders |
| `--input` | stone-100 | Input backgrounds |
| `--ring` | sky-600 | Focus rings |

---

## Spacing Scale

Based on 4px units for consistent rhythm.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--spacing-1` | 0.25rem | 4px | Tight spacing |
| `--spacing-2` | 0.5rem | 8px | Small gaps |
| `--spacing-3` | 0.75rem | 12px | Component padding |
| `--spacing-4` | 1rem | 16px | Standard gap |
| `--spacing-5` | 1.25rem | 20px | Medium spacing |
| `--spacing-6` | 1.5rem | 24px | Section padding |
| `--spacing-8` | 2rem | 32px | Large gaps |
| `--spacing-10` | 2.5rem | 40px | Section margins |
| `--spacing-12` | 3rem | 48px | Major sections |
| `--spacing-16` | 4rem | 64px | Page margins |

---

## Typography Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 0.75rem (12px) | 1rem | Captions, labels |
| `--text-sm` | 0.875rem (14px) | 1.25rem | Small text |
| `--text-base` | 1rem (16px) | 1.5rem | Body text |
| `--text-lg` | 1.125rem (18px) | 1.75rem | Large body |
| `--text-xl` | 1.25rem (20px) | 1.75rem | H4 headings |
| `--text-2xl` | 1.5rem (24px) | 2rem | H3 headings |
| `--text-3xl` | 1.875rem (30px) | 2.25rem | H2 headings |
| `--text-4xl` | 2.25rem (36px) | 2.5rem | H1 headings |

---

## Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.25rem (4px) | Subtle rounding |
| `--radius-md` | 0.5rem (8px) | Buttons, inputs |
| `--radius-lg` | 0.75rem (12px) | Cards, modals |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadow Tokens (Flat Design)

Limited to 2 levels for flat design aesthetic.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Subtle elevation |
| `--shadow-md` | 0 4px 6px -1px rgb(0 0 0 / 0.1) | Moderate elevation |

---

## Container Max-Widths (Fluid Strategy)

Different max-widths per breakpoint.

| Breakpoint | Max-Width | Padding |
|------------|-----------|---------|
| < 640px (mobile) | 100% | 16px |
| 640px - 767px (sm) | 640px | 24px |
| 768px - 1023px (md) | 768px | 24px |
| 1024px - 1279px (lg) | 1024px | 32px |
| 1280px - 1535px (xl) | 1280px | 32px |
| ≥ 1536px (2xl) | 1400px | 32px |

---

## Usage Guidelines

### Using Semantic Tokens

Always use semantic tokens in components, never raw color scales:

```css
/* ✅ Correct */
.card {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
}

/* ❌ Wrong - bypasses theming */
.card {
  background: hsl(24 10% 10%);
  color: white;
}
```

### Using Tailwind Classes

Use the mapped Tailwind classes:

```html
<!-- ✅ Correct -->
<div class="bg-background text-foreground border-border">

<!-- ❌ Wrong - hardcoded colors -->
<div class="bg-gray-900 text-gray-100 border-gray-700">
```

### Primary vs Accent Usage

| Use Primary (Sky Blue) | Use Accent (Orange) |
|------------------------|---------------------|
| CTA buttons | Ratings/scores |
| Links | Favorites/hearts |
| Active tabs | Notifications |
| Focus states | Highlights |
| Form submit buttons | Warning states |

---

## Accessibility Notes

- All color combinations meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- Focus rings use `--ring` token for visibility
- Support `prefers-reduced-motion` for animations
- Support `prefers-color-scheme` for automatic theme detection
