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
