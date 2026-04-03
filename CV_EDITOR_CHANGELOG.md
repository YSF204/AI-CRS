# CV Editor — Development History & Changelog

> **Project:** AI-CRS (AI-powered Career Readiness System)  
> **Session Date:** 2026-04-03  
> **Scope:** Employee-facing CV creation & editing feature

---

## 📌 Context

This project is a full-stack web application built with:

- **Frontend:** React + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Design System:** Brutalist Glassmorphism — dark backgrounds, yellow (`#ffe630`) accents, heavy borders, Space Grotesk + DM Mono typography

The CV feature allows employees to:
1. Browse pre-built CV templates in a gallery
2. Select a template and give their CV a title
3. Fill in their CV data through a structured editor
4. See a live A4 preview as they type
5. Save their CV to the backend

---

## 🧭 Session History (Chronological)

### Phase 1 — CV Gallery Polish

**Changes made to `CVTemplates.jsx`:**
- Removed **"Popular"** and **"Clean Premium"** badges from CV template cards
- Removed template descriptions from the gallery view
- Result: a cleaner, distraction-free template picker

---

### Phase 2 — CV Creation Planning & Model Alignment

**Files reviewed:**
- `backend/src/models/CV.js` — confirmed the full schema
- `backend/src/controllers/cvController.js` — verified CRUD endpoints

**CV Model fields supported:**
```js
{
  jobTitle, summary,
  contact: { phone, email, github, linkedin },
  address: { city, street },
  experience: [{ institutionName, position, duration, summary }],
  education:  [{ institutionName, certification, duration, summary }],
  technicalSkills: [],
  softSkills: [],
  language: [],
  customSections: [{ title, items: [{ name, description, duration, link }] }],
  layout: { sectionOrder: [], visibleSections: {} },
  templateId,
}
```

---

### Phase 3 — Initial CVEditor (broken accordion layout)

The first implementation of `CVEditor.jsx` used a **stacked accordion** approach. Every section rendered as a collapsed accordion on the page simultaneously. This caused:

- Sections stacking on top of each other like plates
- No room to scroll
- Impossible to fill in data
- Very bad UX

---

### Phase 4 — Redesign: 3-Column Layout

**Complete rewrite of `CVEditor.jsx`** into a 3-column layout:

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back   •  Job Title                          [Save CV]   │
├──────────────┬───────────────────────────┬───────────────────┤
│  CV SECTIONS │  Section form cards       │  Live A4 Preview  │
│  ─────────── │  (only active ones show)  │  (real-time)      │
│  ■ Summary   │                           │                   │
│  □ Contact   │                           │                   │
│  □ Experience│                           │                   │
│  ...         │                           │                   │
│  2/9 active  │                           │                   │
└──────────────┴───────────────────────────┴───────────────────┘
```

**Key design decisions:**
- Left sidebar lists all 9 available sections
- Clicking a section **toggles** it into the center as a full form card
- Each section card has its own color-coded header (accent badges)
- Right panel shows a scaled-down, real-time A4 CV preview
- `h-screen overflow-hidden` with independent scroll per column — no page-level scroll

---

### Phase 5 — Sidebar Toggle (Expand / Collapse)

**Added animated sidebar collapse:**

| State | Width | Content |
|---|---|---|
| Expanded | `224px` | Section labels, ✓ badges, count footer |
| Collapsed | `52px` | Icons only, centered, tooltip on hover |

- Width transitions via `cubic-bezier(0.4, 0, 0.2, 1)` over `0.28s`
- `PanelLeftClose` icon rotates `180deg` when sidebar is collapsed
- Active sections show a small yellow dot in collapsed mode
- Footer count and header text hidden when collapsed

---

### Phase 6 — Section Card Collapse Feature

**Added per-section collapse/expand** inside the center panel:

- Each section card header now has a **chevron button** (`▼` / `▶`)
- The form body animates open/closed via `maxHeight: 0 → 2000px` transition
- Collapse state is stored in `collapsedSections: {}` — each section independent
- Useful for keeping multiple sections visible in the list without scrolling through their full forms

---

### Phase 7 — StaggeredMenu Experiment (Reverted)

**Attempted:** Replace the inline sidebar with the `StaggeredMenu` component from [react-bits](https://reactbits.dev/components/staggered-menu).

The StaggeredMenu features:
- Hamburger → X morphing button
- Staggered colored underlay layers that sweep in
- Full-panel overlay with animated item reveal

**Why it was reverted:**
- The StaggeredMenu is designed as a full-screen navigation overlay — it hides the entire page when open
- This made it impossible to see the form AND the preview while selecting sections
- The inline 3-column sidebar is far better UX for a real-time editor workflow

**Files created then deleted:**
- `frontend/src/components/ui/StaggeredMenu.jsx` ❌ removed
- `frontend/src/components/ui/StaggeredMenu.css` ❌ removed

---

### Phase 8 — Final State (Current)

The editor was restored to the **3-column inline sidebar** layout with all improvements accumulated during the session.

---

## 📁 Files Modified / Created

### Modified
| File | What Changed |
|---|---|
| `frontend/src/Pages/Employee/CVEditor.jsx` | Complete rewrite — 3-column layout, sidebar toggle, section collapse |
| `frontend/src/Pages/Employee/CVTemplates.jsx` | Removed badges + descriptions from gallery; redirect to editor on create |
| `frontend/src/Pages/Employee/cvs.jsx` | Added `handleEdit` + wired `onEdit` prop to CVCard |
| `frontend/src/components/Employee/CVCard.jsx` | Made card body & edit button navigate to `/employee/cv-editor/:id` |
| `frontend/src/routes.jsx` | Added protected route `/employee/cv-editor/:id` → `<CVEditor />` |

### Created
| File | Purpose |
|---|---|
| `frontend/src/Pages/Employee/CVEditor.jsx` | Full CV editor page (3-column) |

### Deleted
| File | Reason |
|---|---|
| `frontend/src/components/ui/StaggeredMenu.jsx` | Unused after reverting experiment |
| `frontend/src/components/ui/StaggeredMenu.css` | Unused after reverting experiment |

---

## 🔌 API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/cvs/:id` | Load a CV for editing |
| `PATCH` | `/cvs/:id` | Save updated CV data |
| `POST` | `/cvs` | Create a new CV (from template gallery) |

---

## 🎨 Design System Reference

The editor follows the project's **Brutalist Glassmorphism** theme:

```css
/* Key tokens */
--bg:           #0f0f0f  /* page background */
--card-bg:      #1a1a1a  /* card/sidebar background */
--fg:           #e8e8ec  /* primary text */
--fg-muted:     #6b6b7b  /* secondary text */
--border-color: #2a2a3a  /* border color */
--yellow:       #ffe630  /* primary accent */
--mint:         #a8e6cf  /* success */
--coral:        #ff6b6b  /* error */

/* Typography */
font-family: 'Space Grotesk', 'DM Mono', sans-serif;
```

---

## 🔄 User Flow (Current)

```
Employee Dashboard
       │
       ▼
  CV Templates Gallery
  (browse 7 templates)
       │
       │ Select template + enter title + click Create
       ▼
  CV Editor (/employee/cv-editor/:id)
  ┌─────────────────────────────────────────────────┐
  │  Sidebar  │  Form Cards       │  A4 Preview     │
  │  (toggle) │  (active sections)│  (live update)  │
  └─────────────────────────────────────────────────┘
       │
       │ Click Save
       ▼
  PATCH /cvs/:id  →  MongoDB
```

---

## ✅ Features Summary

- [x] Template gallery with 7 pre-built CV designs
- [x] Create CV with title → redirect to editor
- [x] Edit existing CVs from My CVs page
- [x] 3-column editor layout (sidebar / form / preview)
- [x] Animated collapsible sidebar (expand ↔ collapse)
- [x] Per-section form cards with collapse toggle
- [x] Live A4 preview scaled to fit panel
- [x] Tag-chip inputs for skills and languages
- [x] Reorderable experience / education entries
- [x] Custom sections (user-defined title + items)
- [x] Auto-activate sections that already have data on load
- [x] Toast notifications for save success / error
- [x] All data persisted via REST API to MongoDB
