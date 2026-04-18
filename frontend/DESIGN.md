# AI-CRS Landing Page — Design Documentation

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | 19 |
| Build Tool | Vite | 7.3 |
| CSS Framework | Tailwind CSS | v4 |
| Animation | GSAP | latest |
| Icons | lucide-react | latest |
| Fonts | Google Fonts (CDN) | — |

### NPM Packages

```
react, react-dom, tailwindcss, @tailwindcss/vite, gsap, lucide-react
```

---

## Design System: Neo Brutalism

**Philosophy**: Raw, punchy, flat aesthetic — thick borders, hard offset shadows, bold uppercase typography, high-contrast accent colors. No gradients, no blur, no rounded corners.

---

## Typography

| Role | Font Family | Weight | Source |
|------|------------|--------|--------|
| **Display / Headings** | `Space Grotesk` | 700 (Bold) | Google Fonts |
| **Body / Monospace** | `DM Mono` | 400 / 500 | Google Fonts |
| **CV Classic template** | `Georgia, serif` | 400 / 700 | System |
| **CV Minimal template** | `Helvetica Neue, Helvetica, Arial` | 500 / 800 | System |
| **CV Modern template** | `Segoe UI, Arial, sans-serif` | 400 / 600 / 800 | System |

### Font Sizes (responsive `clamp()`)

| Element | Size |
|---------|------|
| Hero `h1` | `clamp(2.5rem, 7vw, 6rem)` |
| Section `h2` | `clamp(1.8rem, 4.5vw, 4rem)` |
| Body text | `clamp(0.9rem, 1.4vw, 1.2rem)` |
| Labels/tags | `clamp(0.6rem, 0.85vw, 0.75rem)` |
| Navbar logo | `clamp(1.1rem, 2vw, 1.5rem)` |
| Navbar links | `clamp(0.7rem, 1vw, 0.85rem)` |
| Button text | `clamp(0.8rem, 1.1vw, 1rem)` |

---

## Color System

### Theme Modes

#### Light Mode (Default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F0EFEB` | Page background |
| `--fg` | `#0a0a0a` | Primary text |
| `--fg-muted` | `rgba(10,10,10,0.5)` | Secondary text |
| `--border-color` | `#0a0a0a` | Card / section borders |
| `--card-bg` | `#F0EFEB` | Card backgrounds |
| `--shadow-color` | `#0a0a0a` | Hard offset shadows |
| `--nav-bg` | `#F0EFEB` | Navbar background |

#### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#1a1a1f` | Page background (warm charcoal) |
| `--fg` | `#e8e8ec` | Primary text (soft white) |
| `--fg-muted` | `rgba(232,232,236,0.55)` | Secondary text |
| `--border-color` | `#9090a0` | Card / section borders (muted blue-gray) |
| `--card-bg` | `#222228` | Card backgrounds |
| `--shadow-color` | `#9090a0` | Hard offset shadows |
| `--nav-bg` | `#1e1e24` | Navbar background |

### Accent Colors

| Name | Hex | Tailwind Token | Usage |
|------|-----|---------------|-------|
| Electric Yellow | `#FFE630` | `brutal-yellow` | Logo, primary CTAs, stats, feature cards |
| Hot Coral | `#FF6B6B` | `brutal-coral` | Features badge, stats, accent blocks |
| Teal | `#4ECDC4` | `brutal-teal` | Features, team section, quote accent |
| Mint | `#A8E6CF` | `brutal-mint` | Stats, team cards |
| Blue | `#6C63FF` | `brutal-blue` | Feature card (Secure & Private) |

### CV Template Accent Colors

| Template | Color | Hex |
|----------|-------|-----|
| Classic Serif | — | No accent (traditional B&W) |
| Modern | Blue | `#2563EB` |
| Two-Column sidebar | Sky Blue | `#38bdf8` / sidebar `#1e293b` |
| Minimal Swiss | — | Pure black `#111` and gray hierarchy |

---

## Spacing System

All spacing uses **percentage-based** or **`clamp()`** values for full responsiveness:

| Element | Padding |
|---------|---------|
| Section padding | `clamp(4rem, 10%, 8rem) clamp(1.5rem, 5%, 4rem)` |
| Hero padding | `clamp(6rem, 12%, 10rem) clamp(1.5rem, 5%, 4rem) clamp(3rem, 6%, 5rem)` |
| Navbar padding | `clamp(0.6rem, 1.5%, 1rem) clamp(1.25rem, 3%, 2.5rem)` |
| Card padding | `clamp(1.25rem, 2.5%, 2rem)` |
| Button padding | `clamp(0.6rem, 1.2%, 0.9rem) clamp(1.25rem, 2.5%, 2rem)` |
| Grid gaps | `clamp(1rem, 2%, 1.5rem)` |

---

## Borders & Shadows

### Brutalist Card (`.brutal-card`)

```css
border: 3px solid var(--border-color);
box-shadow: var(--brutal-shadow); /* 6px 6px 0px var(--shadow-color) */
```

**Hover**: `translate(-2px, -2px)`, shadow grows to `8px 8px 0px`.

### Colored Card Variants

Cards with accent backgrounds (`.brutal-card-yellow`, `-coral`, `-teal`, `-mint`) always use `#0a0a0a` borders and shadows regardless of theme, since the colored background provides contrast.

### Buttons

| Type | Border | Shadow | Hover |
|------|--------|--------|-------|
| `.brutal-btn` | `3px solid #0a0a0a` | `4px 4px 0 #0a0a0a` | Lifts + shadow grows |
| `.brutal-btn-outline` | `3px solid var(--border-color)` | `4px 4px 0 var(--shadow-color)` | Fills bg with `var(--fg)`, inverts text |

**Press state**: `translate(2px, 2px)`, shadow shrinks to `2px 2px`.

---

## Animations

### GSAP — CardSwap (CV Carousel)

- **Library**: `gsap` (GreenSock Animation Platform)
- **Behavior**: Cards stack with horizontal (`40px`) and vertical (`28px`) offset. Every 4 seconds, the front card slides out (left + fade), remaining cards shift forward smoothly.
- **Easing**: `power2.in` (exit), `power2.out` (re-stack)
- **Opacity**: `1 - i * 0.04` per stack position (nearly fully opaque)
- **Scale**: `1 - i * 0.03` per stack position
- **Pause on hover**: Disabled

### CSS Animations

| Animation | Usage | Details |
|-----------|-------|---------|
| `brutalReveal` | Section entrance | `translateY(30px) → 0`, `opacity 0 → 1`, 0.6s with staggered delays (0.1s–0.4s) |
| `marquee` | Stats scrolling strip | `translateX(0) → translateX(-50%)`, 20s linear infinite |
| `shadowShift` | Hero image hover | Shadow grows `8px → 14px` then cycles yellow → coral → teal → black, 2.5s |

### CV Card Hover Effects

| Card | Transform | Shadow |
|------|-----------|--------|
| Classic | `translateY(-6px) scale(1.02)` | Warm offset shadow |
| Modern | `translateY(-5px) scale(1.02)` | `6px 6px 0 #2563EB` |
| Two-Column | `perspective(800px) rotateY(-3deg) translateY(-4px)` | `8px 6px 0 #38bdf8` |
| Minimal | `translateY(-5px) scale(1.03)` | `0 8px 0 #222` |

---

## Components

### File Structure

```
src/
├── context/
│   └── ThemeContext.jsx          # Light/dark mode provider + toggle
├── Pages/Public/
│   ├── LandingPage.jsx           # Main page assembling all sections
│   ├── Navbar.jsx                # Fixed top nav with theme toggle
│   ├── HeroSection.jsx           # Hero with headline + CV showcase
│   ├── CardSwap.jsx              # GSAP card carousel engine
│   ├── CVShowcase.jsx            # 4 CV templates + carousel wrapper
│   ├── StatsSection.jsx          # Marquee strip + stat blocks
│   ├── FeaturesSection.jsx       # 5 feature cards grid
│   ├── QuoteSection.jsx          # Full-viewport quote section
│   ├── TeamSection.jsx           # 4 team member cards
│   └── Footer.jsx                # Footer with logo, links, university
└── index.css                     # Global design system + utilities
```

### Section Breakdown

| Section | Description |
|---------|-------------|
| **Navbar** | Fixed top, thick bottom border, yellow logo label, uppercase tracked nav links, Sun/Moon theme toggle, "Get Started" CTA |
| **Hero** | Full `100vh`, two-column: left = giant title + subtitle + 2 buttons, right = GSAP CardSwap carousel with 4 CV templates |
| **Stats** | Yellow marquee scrolling strip + 4 colored stat blocks (yellow/coral/teal/mint) with thick black dividers |
| **Features** | "EVERYTHING YOUR CV NEEDS" heading + 5 brutalist cards with colored icon blocks (lucide-react icons) |
| **Quote** | Full `100vh`, diagonal stripe pattern background, colored geometric accent blocks, giant `"` mark, brutalist author tag |
| **Team** | 4 cards with colored square initials blocks, uppercase names, tracked role text |
| **Footer** | Thick top border, yellow logo, uppercase nav links, university info |

### CV Templates (4 unique designs)

| # | Name | Layout | Font | Unique Feature |
|---|------|--------|------|----------------|
| 1 | **Classic Serif** | Single column, centered header | Georgia | Traditional horizontal rules, serif elegance |
| 2 | **Modern Accent** | Left blue accent bar | Segoe UI / Arial | Pill-shaped skill tags, professional summary block |
| 3 | **Two-Column** | 35% dark sidebar + 65% white main | System sans | Initials circle avatar, sidebar contact/skills list |
| 4 | **Minimal Swiss** | Single column, grid layout | Helvetica Neue | Oversized uppercase name, thick black rule, maximum whitespace |

---

## Theme Toggle

- **Implementation**: React Context (`ThemeContext.jsx`)
- **Persistence**: `localStorage.setItem('theme', 'light' | 'dark')`
- **DOM**: Sets `data-theme` attribute on `<html>` element
- **CSS switching**: `:root` (light) vs `[data-theme="dark"]` selectors
- **Toggle UI**: Square button in navbar with `Moon` / `Sun` icons from lucide-react
- **Button animation**: Press down (`translate(2px, 2px)`, shadow shrinks) on mouseDown

---

## Responsive Design

- All font sizes use `clamp(min, preferred, max)` for fluid scaling
- All spacing uses percentage-based or `clamp()` values
- Grid layouts use `auto-fit` with `minmax()` for natural breakpoints
- Hero section switches from `flex-row` to `flex-col` at `lg` breakpoint (Tailwind)
- Nav center links hidden on mobile (`hidden md:flex`)
- Stats grid auto-fits from 4 columns to single column

---

## Fonts Import (index.html)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
```

---

# Employee Dashboard — Paper Design System

## Design Philosophy

**Paper Design System**: Print-inspired, high-clarity interface that preserves minimal, clean, print-inspired hierarchy while adding stronger structure, discoverability, and interaction quality. The system prioritizes reusable frontend architecture, explicit component states, and WCAG 2.2 AA acceptance criteria.

**Key Principles**:
- Minimalism + Swiss Grid + Editorial layout accents
- Single source of truth for design tokens
- Explicit component states (default/hover/focus/active/disabled/loading/error)
- Typography-driven hierarchy with clear visual weight
- Purposeful motion (no decorative loops)

---

## Typography System

### Font Families (Paper Design System)

| Role | Font Family | Weight | Usage |
|------|------------|--------|-------|
| **Display / Headings** | `Montserrat` | 600/700/800 | Page titles, section headings, card titles |
| **Body / Forms** | `Roboto` | 300/400/500/700 | Body text, form inputs, buttons, labels |
| **Compact Data Labels** | `PT Mono` | 400/500 | Metadata, timestamps, stats, technical labels |
| **CV Classic template** | `Georgia, serif` | 400 / 700 | System |
| **CV Minimal template** | `Helvetica Neue, Helvetica, Arial` | 500 / 800 | System |
| **CV Modern template** | `Segoe UI, Arial, sans-serif` | 400 / 600 / 800 | System |

### Typography Scale (Paper Design System)

| Token | Value | Usage |
|-------|-------|-------|
| `--text-xs` | 14px | Small labels, metadata, compact text |
| `--text-sm` | 16px | Body text, standard content |
| `--text-base` | 18px | Emphasized body text, subheadings |
| `--text-lg` | 24px | Section headings, card titles |
| `--text-xl` | 32px | Page titles, major headings |
| `--text-2xl` | 40px | Hero titles, display headings |

### Typography Classes

```css
.text-display-xl    /* 40px, weight 800 - Hero titles */
.text-display-lg    /* 32px, weight 800 - Page titles */
.text-display-md    /* 24px, weight 700 - Section headings */
.text-body-lg       /* 18px, weight 500 - Emphasized body */
.text-body          /* 16px, weight 400 - Standard body */
.text-body-sm       /* 14px, weight 400 - Small body */
.text-mono          /* PT Mono - Data labels */
.text-mono-sm       /* PT Mono, 14px - Compact data */
```

### Font Import (Paper Design System)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=PT+Mono:wght@400;500&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
```

---

## Color System (Paper Design System)

### Semantic Color Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-primary` | `#1a6b5a` | `#34d399` | Main brand/accent color, CTAs |
| `--color-primary-light` | `#e8f5f0` | `rgba(52,211,153,0.1)` | Light accent backgrounds |
| `--color-primary-hover` | `#155c4d` | `#2cc48a` | Hover state for primary |
| `--color-secondary` | `#c8a97e` | `#c8a97e` | Warm accent gold/bronze |
| `--color-secondary-light` | `#f5edd9` | `rgba(200,169,126,0.12)` | Light warm backgrounds |
| `--color-success` | `#16a34a` | `#4ade80` | Success states, positive actions |
| `--color-success-light` | `#dcfce7` | `rgba(22,163,74,0.15)` | Light success backgrounds |
| `--color-success-hover` | `#15803d` | - | Hover state for success |
| `--color-warning` | `#d97706` | `#facc15` | Warning states, pending actions |
| `--color-warning-light` | `#fef3c7` | `rgba(217,119,6,0.15)` | Light warning backgrounds |
| `--color-warning-hover` | `#b45309` | - | Hover state for warning |
| `--color-danger` | `#dc2626` | `#f87171` | Error states, destructive actions |
| `--color-danger-light` | `#fee2e2` | `rgba(220,38,38,0.15)` | Light danger backgrounds |
| `--color-danger-hover` | `#b91c1c` | - | Hover state for danger |

### Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-surface-1` | `#faf6f0` | `#1c1917` | Main background |
| `--color-surface-2` | `#ffffff` | `#262220` | Card background |
| `--color-surface-3` | `#f9f5ef` | `#2d2824` | Alternate card background |
| `--color-surface-4` | `#f3ede4` | `#231f1b` | Elevated surface |
| `--color-surface-5` | `#e8e2d9` | `#2d2824` | Border/divider color |

### Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-text-primary` | `#111827` | `#e7e5e4` | Primary text color |
| `--color-text-secondary` | `#78716c` | `#a8a29e` | Secondary/muted text |
| `--color-text-tertiary` | `#a8a29e` | `#78716c` | Tertiary/subtle text |
| `--color-text-inverse` | `#ffffff` | `#1c1917` | Text on dark backgrounds |

### Border Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-border-strong` | `#d6cfc4` | `#3d3530` | Strong borders |
| `--color-border-weak` | `#e8e2d9` | `#2d2824` | Weak/subtle borders |

---

## Spacing System (Paper Design System)

### Spacing Scale (4px base unit)

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-1` | 4px | Micro spacing, tight gaps |
| `--spacing-2` | 8px | Small spacing, icon gaps |
| `--spacing-3` | 12px | Compact spacing, label margins |
| `--spacing-4` | 16px | Standard spacing, element gaps |
| `--spacing-6` | 24px | Medium spacing, section margins |
| `--spacing-8` | 32px | Large spacing, major sections |

### Spacing Utility Classes

```css
.p-1, .p-2, .p-3, .p-4, .p-6, .p-8          /* Padding all sides */
.px-1, .px-2, .px-3, .px-4, .px-6           /* Padding horizontal */
.py-1, .py-2, .py-3, .py-4, .py-6           /* Padding vertical */
.m-1, .m-2, .m-3, .m-4, .m-6               /* Margin all sides */
.mb-1, .mb-2, .mb-3, .mb-4, .mb-6, .mb-8   /* Margin bottom */
.mt-1, .mt-2, .mt-3, .mt-4, .mt-6          /* Margin top */
.gap-1, .gap-2, .gap-3, .gap-4, .gap-6      /* Gap for flex/grid */
```

---

## Component States (Paper Design System)

### Interactive States

| State | Token | Usage |
|-------|-------|-------|
| Default | `--interactive-default` | Base interactive element state |
| Hover | `--interactive-hover` | Mouse hover state |
| Focus | `--interactive-focus` | Keyboard focus state |
| Active | `--interactive-active` | Mouse click/active state |
| Disabled | `--interactive-disabled` | Disabled element state |

### Status Colors (Dashboard Consistency)

| State | Token | Usage |
|-------|-------|-------|
| Active | `--status-active` | Active items, success states |
| Pending | `--status-pending` | Pending items, warning states |
| Inactive | `--status-inactive` | Inactive items, disabled states |
| Error | `--status-error` | Error states, danger items |

---

## Component Patterns

### Dashboard Cards

**KPI Card**: Compact metric display with emphasis on numbers
```jsx
<div className="kpi-card">
  {/* Metric content */}
</div>
```

**Workflow Card**: Action-oriented card with clear CTAs
```jsx
<div className="workflow-card">
  {/* Workflow content with actions */}
</div>
```

**Paper Card**: Standard card component
```jsx
<div className="paper-card">
  {/* Card content */}
</div>
```

### Buttons

**Primary Button**: Main actions
```jsx
<button className="paper-btn">
  {/* Button content */}
</button>
```

**Outline Button**: Secondary actions
```jsx
<button className="paper-btn-outline">
  {/* Button content */}
</button>
```

### Status Pills

```jsx
<div className="status-pill status-pill-active">Active</div>
<div className="status-pill status-pill-pending">Pending</div>
<div className="status-pill status-pill-inactive">Inactive</div>
<div className="status-pill status-pill-error">Error</div>
```

### Form Elements

```jsx
<input className="form-field" placeholder="Label" />
<label className="form-label">Field Label</label>
<div className="form-section">
  {/* Form content */}
</div>
```

---

## Dashboard Layout Structure

### Editorial Dashboard Anatomy

1. **Sticky Action Header**: Navigation and primary actions
2. **Scannable Quick Actions**: High-frequency tasks prominently displayed
3. **KPI Rail**: Key metrics at a glance
4. **Priority Workflow Cards**: Important tasks and workflows
5. **Activity Stream**: Recent activities and updates (progressive disclosure)

### Grid System

```jsx
<div className="dashboard-grid">
  {/* Auto-fit grid with minmax(280px, 1fr) */}
</div>
```

---

## Accessibility Requirements (WCAG 2.2 AA)

### Color Contrast
- All text must meet 4.5:1 contrast ratio for normal text
- Large text (18px+) must meet 3:1 contrast ratio
- Interactive elements must have visible focus states

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicators required (2px solid outline)
- Logical tab order throughout the interface

### Screen Reader Support
- Proper semantic HTML structure
- ARIA labels where needed
- Status announcements for dynamic content

### Motion Preferences
- `prefers-reduced-motion` support for all animations
- Purposeful motion only (150-250ms interactions)
- No decorative loops or continuous animations

---

## Migration Notes

### Legacy Color Mappings

For backward compatibility, these legacy variables are mapped to semantic tokens:

| Legacy Variable | Semantic Token |
|-----------------|----------------|
| `var(--yellow)` | `var(--color-warning)` |
| `var(--coral)` | `var(--color-danger)` |
| `var(--teal)` | `var(--color-primary)` |
| `var(--mint)` | `var(--color-success)` |
| `var(--blue)` | `var(--color-primary)` |

### Component Migration Checklist

- [ ] Replace inline colors with semantic tokens
- [ ] Update font families to Paper system (Roboto/Montserrat/PT Mono)
- [ ] Ensure proper component states (hover/focus/active/disabled)
- [ ] Verify accessibility compliance (contrast, focus, keyboard)
- [ ] Test responsive behavior across breakpoints
- [ ] Validate motion preferences support

---

## Navigation System

### Anatomy
- **PillNav Container**: Centralized core component for both public and authenticated routes.
- **Logo Slot**: Consistent text-based logo matching the Paper typography.
- **Primary Links Rail**: Horizontal list of navigation items. Active states are indicated by a sliding pill background.
- **Secondary Actions Rail**: Quick actions such as theme toggle and user profile menus.
- **Dashboard Quick Actions (Employee)**: Secondary row rendered beneath the main navbar on employee dashboards.

### State Rules
- **Hover/Focus**: Smooth color transitions using `--nav-transition-duration`. Visible focus rings on all interactive elements.
- **Active Route**: Highlighted by the sliding pill background (`--nav-pill-bg`) and text color (`--nav-pill-text`).
- **Reduced Motion**: If user prefers reduced motion, the initial entrance animation is skipped.

### Tokens
Semantic values for the navbar are managed in `index.css`:
- `--nav-bg`
- `--nav-border`
- `--nav-pill-bg`
- `--nav-pill-text`
- `--nav-text-default`
- `--nav-text-hover`
- `--nav-focus-ring`
- `--navbar-height` and `--navbar-min-height` guarantee stable block layout without reflows.

### Responsive Behavior
- **Mobile**: Primary links rail is hidden (`md:flex`). Secondary actions remain visible.
- **Dashboard**: Fixed heights and layout to prevent UI shifting during route changes.

### Accessibility (WCAG 2.2 AA)
- Touch targets: `minHeight: 36px` on all action buttons and links.
- Contrast: Dark mode text is adjusted to `--text-muted` and `--color-primary` for proper background legibility.
- Keyboard: All buttons, links, and dropdowns support tab navigation, Enter/Space activation, and visible focus rings.

---
