# Gentlemen Cricket Ground (GCG) - Design System & Style Guide v2.0

> **Design Philosophy**
>
> Gentlemen Cricket Ground should feel like a premium members-only cricket club rather than a typical booking application. Every interface should communicate elegance, trust, speed, and craftsmanship through restrained visuals, thoughtful spacing, smooth interactions, and consistent patterns.

---

# 🎯 Core Design Principles

## 1. Less But Better

Every UI element must have a purpose.

Avoid unnecessary:

- Borders
- Icons
- Colors
- Labels
- Decorations

Whitespace is a design element.

---

## 2. Strong Visual Hierarchy

Every page should immediately answer:

1. Where am I?
2. What is important?
3. What should I do next?

Hierarchy should come from:

- Typography
- Spacing
- Size
- Contrast

Never rely on excessive colors.

---

## 3. Premium Dark Mode

The application is designed **Dark Mode First**.

Never use pure black.

Instead create layered surfaces that naturally separate content.

```
Background
↓
Sections
↓
Cards
↓
Interactive Elements
↓
Focused Element
```

---

## 4. Mobile First

Every page must be designed for mobile first and progressively enhanced for larger screens.

Design order:

```
Mobile
↓

Tablet
↓

Laptop
↓

Desktop
↓

Ultra-wide
```

---

# 🎨 Color System

## Neutral Palette

| Shade | HEX | Usage |
|------|------|---------|
| 950 | `#030712` | Main Background |
| 900 | `#111827` | Sections |
| 800 | `#1F2937` | Elevated Surfaces |
| 700 | `#374151` | Borders |
| 600 | `#4B5563` | Disabled |
| 500 | `#6B7280` | Secondary Text |
| 400 | `#9CA3AF` | Labels |
| 300 | `#D1D5DB` | Dividers |
| 100 | `#F3F4F6` | Primary Text |

---

## Emerald Palette

Reserved for success, active states and premium ambient lighting.

| Shade | HEX |
|------|------|
| 950 | `#022C22` |
| 900 | `#064E3B` |
| 800 | `#065F46` |
| 700 | `#047857` |
| 600 | `#059669` |
| 500 | `#10B981` |

---

## Gold Palette

Gold is the primary brand color.

Use sparingly.

| Shade | HEX |
|------|------|
| 700 | `#B8860B` |
| 600 | `#C89B1D` |
| 500 | `#D4AF37` |
| 400 | `#F1C40F` |

---

## Semantic Colors

| Purpose | Tailwind |
|----------|----------|
| Success | `emerald-500` |
| Warning | `amber-500` |
| Error | `rose-500` |
| Info | `sky-500` |

---

## Color Usage Rule

```
80% Neutral Colors

15% Gold Accent

5% Status Colors
```

Never introduce random reds, blues, or greens outside semantic usage.

---

# ✍ Typography

## Font Stack

### Headings

- Font: `Outfit`
- Weight: `600–700`
- Tracking: `tracking-tight`

Tailwind

```css
font-outfit font-bold tracking-tight text-zinc-100
```

---

### Body

Font

```
Inter
```

Tailwind

```css
font-inter leading-relaxed text-zinc-400
```

---

### Monospace

```
Geist Mono
```

Fallback

```
Fira Code
```

Tailwind

```css
font-mono text-amber-500
```

---

## Type Scale

| Type | Tailwind |
|---------|------------|
| Display | `text-6xl` |
| Hero | `text-5xl` |
| H1 | `text-4xl` |
| H2 | `text-3xl` |
| H3 | `text-2xl` |
| H4 | `text-xl` |
| Body | `text-base` |
| Small | `text-sm` |
| Caption | `text-xs` |

Never skip heading hierarchy.

---

# 📐 Layout System

## Maximum Width

```css
max-w-7xl
```

---

## Mobile Padding

```css
px-4
```

or

```css
px-6
```

---

## Grid

```css
grid
grid-cols-1
md:grid-cols-2
lg:grid-cols-3
gap-6
```

---

## Spacing System

Follow an **8pt Grid**.

Allowed spacing

```
2
4
6
8
10
12
16
20
24
32
40
48
64
80
96
```

Avoid arbitrary spacing values.

---

## Section Spacing

```css
py-16 md:py-24
```

---

## Card Padding

```css
p-6 md:p-8
```

---

# 🪟 Surface & Elevation

Instead of shadows only, combine:

- Transparency
- Blur
- Borders
- Soft Shadows

---

## Background

```css
bg-zinc-950
```

---

## Sections

```css
bg-zinc-900/20
```

---

## Cards

```css
bg-zinc-900/40
backdrop-blur-xl
border
border-white/5
shadow-2xl
```

---

## Modal

```css
bg-zinc-900/90
backdrop-blur-3xl
```

---

## Dropdown

```css
bg-zinc-900/80
backdrop-blur-xl
border-white/10
```

---

# ✨ Visual Effects

## Glassmorphism

Only floating containers should use glass.

```css
bg-zinc-900/50
backdrop-blur-xl
border border-white/5
shadow-2xl
```

Avoid glass on every component.

---

## Ambient Background Glow

Create depth using blurred gradients.

```css
w-72
h-72
rounded-full
bg-emerald-500/10
blur-3xl
absolute
-z-10
```

---

## Noise Texture

Very subtle grain (2–4% opacity) may be applied to premium pages to reduce flatness.

---

## Gradient Usage

Allowed

- Radial
- Linear
- Mesh (subtle)

Avoid rainbow gradients.

---

# 🔘 Buttons

## Primary Button

```css
bg-gradient-to-r
from-amber-500
to-amber-600
hover:from-amber-600
hover:to-amber-700
text-zinc-950
font-bold
rounded-xl
shadow-lg
hover:-translate-y-0.5
hover:shadow-amber-500/20
active:translate-y-0
active:scale-95
transition-all
duration-200
```

---

## Secondary Button

```css
bg-zinc-800/80
hover:bg-zinc-700
text-zinc-100
border
border-zinc-700/50
rounded-xl
transition-all
```

---

## Ghost Button

Transparent with subtle hover surface.

---

## Destructive Button

Use only

```
rose-500
```

---

Button heights

| Size | Height |
|------|---------|
| Small | 40px |
| Medium | 48px |
| Large | 56px |

---

# 📝 Form Elements

## Inputs

```css
w-full
bg-zinc-900/80
border
border-zinc-800
rounded-xl
px-4
py-3
text-zinc-100
placeholder-zinc-500
focus:border-amber-500
focus:ring-1
focus:ring-amber-500
outline-none
transition-all
```

---

Rules

- Labels always above inputs
- Helper text below
- Inline validation
- Never use alert popups for validation
- Minimum height: 48px

---

# 📦 Cards

Each card should contain:

- Title
- Supporting description
- Main content
- Optional footer

Cards should never feel cramped.

---

# 📊 Tables

Modern tables must support:

- Sticky header
- Search
- Sorting
- Filtering
- Pagination
- Row hover
- Row selection
- Empty state
- Skeleton loading

---

# 💬 Feedback

Use Toast notifications.

Position

```
Top Right
```

Status

- Success
- Error
- Info

Auto dismiss unless action required.

---

# ⌛ Loading States

Prefer

✅ Skeleton UI

Avoid

❌ Infinite spinners

Only use spinners for blocking operations.

---

# 🔍 Search Experience

Search should support

- Debouncing
- Keyboard navigation
- Highlight matches

Use

```
Ctrl + K
```

for global search where appropriate.

---

# 🎬 Motion & Animation

Animations should feel natural.

Duration

| Type | Duration |
|--------|----------|
| Hover | 150–200ms |
| Modal | 250ms |
| Drawer | 300ms |
| Page | 350ms |

Preferred easing

```
ease-out
```

or

```
cubic-bezier(.22,1,.36,1)
```

Allowed animations

- Fade
- Scale
- Slide
- Blur
- Opacity

Avoid

- Bounce
- Shake
- Spin
- Flash

unless providing feedback.

---

# ♿ Accessibility

Minimum touch target

```
44 × 44px
```

Requirements

- WCAG AA contrast
- Keyboard navigation
- Visible focus states
- Screen reader support
- Proper semantic HTML

Never remove outlines without replacement.

---

# 🚀 Performance Guidelines

- Lazy load images
- Use AVIF/WebP
- Responsive image sizes
- Preload fonts
- Respect `prefers-reduced-motion`
- Avoid unnecessary re-renders
- Optimize animations with GPU-friendly properties (`transform`, `opacity`)

---

# 🧩 Component Requirements

Every reusable component must support:

- Hover
- Active
- Focus
- Disabled
- Loading
- Error
- Success
- Mobile responsiveness
- Dark mode
- Keyboard interaction

---

# 🧠 UX Best Practices

Every page should include appropriate:

- Loading state
- Empty state
- Error state
- Success feedback
- Helpful validation
- Clear call-to-actions

Prefer:

- Optimistic UI
- Undo instead of confirmation
- Progressive disclosure
- Contextual help
- Auto-save where appropriate

---

# 🎯 AI Implementation Rules

When generating UI code, always:

- Use semantic HTML (`header`, `main`, `nav`, `section`, `article`, `footer`)
- Build reusable components instead of duplicating layouts
- Follow the 8-point spacing system
- Use centralized design tokens (colors, spacing, radius, typography, shadows)
- Never hardcode colors or spacing values
- Maintain consistent interaction patterns across pages
- Optimize for accessibility and performance
- Respect reduced-motion preferences
- Keep interfaces minimal, spacious, and visually balanced

---

# ✅ Verification Checklist

- [ ] Premium luxury aesthetic is maintained throughout the application.
- [ ] Mobile-first layouts work correctly at **375px** width without horizontal scrolling.
- [ ] Typography follows the defined hierarchy consistently.
- [ ] Gold is used only for primary emphasis and branding.
- [ ] Emerald is reserved for success states and subtle ambient effects.
- [ ] No hard-coded colors outside the design token system.
- [ ] All components support hover, focus, active, disabled, loading, and error states.
- [ ] Skeleton loaders are used instead of spinners where appropriate.
- [ ] Interactive elements provide clear keyboard focus indicators.
- [ ] Motion is subtle, performant, and respects `prefers-reduced-motion`.
- [ ] All pages follow the same spacing, radius, elevation, and typography system.
- [ ] Components are reusable, responsive, accessible, and production-ready.