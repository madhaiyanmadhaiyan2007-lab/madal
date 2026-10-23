---
name: Intelligent Clarity
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#414753'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#717785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005cbb'
  primary: '#0059b5'
  on-primary: '#ffffff'
  primary-container: '#0071e3'
  on-primary-container: '#fcfbff'
  inverse-primary: '#abc7ff'
  secondary: '#5b3cdd'
  on-secondary: '#ffffff'
  secondary-container: '#7459f7'
  on-secondary-container: '#fffbff'
  tertiary: '#006a26'
  on-tertiary: '#ffffff'
  tertiary-container: '#008633'
  on-tertiary-container: '#f1ffec'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#abc7ff'
  on-primary-fixed: '#001b3f'
  on-primary-fixed-variant: '#00458f'
  secondary-fixed: '#e5deff'
  secondary-fixed-dim: '#c9bfff'
  on-secondary-fixed: '#1a0063'
  on-secondary-fixed-variant: '#441cc8'
  tertiary-fixed: '#72fe88'
  tertiary-fixed-dim: '#53e16f'
  on-tertiary-fixed: '#002107'
  on-tertiary-fixed-variant: '#00531c'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 38px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1.25rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an Apple-inspired precision aesthetic tailored for high-stakes interview preparation. The emotional target is calm confidence, technological rigor, and cognitive clarity. By blending expansive white space, luminous frosted glass panels, and disciplined micro-interactions, the UI reduces candidate anxiety while conveying enterprise-grade AI intelligence.

The visual dialect synthesizes Modern Cupertino Minimalism with focused Glassmorphism. The primary mode utilizes high-key airy neutrals (`#FFFFFF` and `#F5F5F7`), delineated with hairline structural borders (`#E5E5EA`) and ultra-soft optical shadows. In contrast, the dedicated real-time interview simulator switches to an immersive cinematic dark mode (`#000000`), turning technical metrics—such as acoustic jitter, linguistic prosody, and gaze metrics—into high-contrast, luminous instrumentation.

## Colors

The system uses a tightly controlled palette anchored in neutral precision, energized by a primary chromatic gradient transition from Apple Blue (`#0071E3`) to Electric Purple (`#7B61FF`).

### Base Surfaces & Content
- **Canvas Base:** `#FFFFFF` (Primary white) and `#F5F5F7` (Secondary structural background)
- **Card Surfaces:** `#FFFFFF` with translucent variants (`rgba(255, 255, 255, 0.8)`) for frosted navigation and floating feedback modules.
- **Hairline Dividers:** `#E5E5EA` and `#E8E8ED`
- **Text Primary:** `#1D1D1F` (95% optical contrast on light backgrounds)
- **Text Secondary:** `#6E6E73` (Balanced metadata and guidance labels)

### Diagnostic Accents
- **Action & Focus:** `#0071E3` (Apple Blue)
- **Cognitive Flow & AI Synthesis:** `#7B61FF` (Electric Purple)
- **Positive Behavioral Signal:** `#34C759` (Emerald Green)
- **Vocal Latency / Filler Alert:** `#FF9F0A` (Amber Warning)
- **Critical Friction / Posture Alert:** `#FF3B30` (System Red)

### Deep Space Simulator (Dark Mode Context)
- **Simulator Canvas:** `#000000`
- **Simulator Panel Surfaces:** `rgba(28, 28, 30, 0.75)`
- **Simulator Text:** `#F5F5F7`
- **Gaze & Speech Glow Accents:** `#34C759` (Emerald Glow) and `#5E5CE6` (Speech Indigo)

## Typography

Typography prioritizes extreme neutral clarity reminiscent of SF Pro Display and SF Pro Text. When implementing within system frameworks, standard fallback priority must always lead with `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif`.

### Tracking & Kerning Strategy
- **Headlines & Displays:** Enforce strict negative tracking (`-0.02em` to `-0.03em`) on sizes `20px` and larger to create the signature tight, premium hardware aesthetic.
- **Micro Labels & Badges:** Use subtle positive tracking (`+0.02em` to `+0.04em`) on `11px`–`12px` upper-case badges to maintain optical legibility during real-time sessions.
- **Multilingual Consistency:** Font metrics must preserve line-height across Latin, Cyrillic, CJK, and Indic scripts without clipping diacritics during dynamic audio transcription streams.

## Layout & Spacing

The structural framework balances structured density with breathing space, reflecting editorial discipline.

### Breakpoints & Responsive Columns
- **Desktop (≥ 1280px):** 12-column grid, max content container of `1280px`, outer margin `margin-desktop` (`3rem`), column gutter `gutter-lg` (`2rem`).
- **Tablet (768px – 1279px):** 8-column grid, dynamic canvas margins `margin` (`2rem`), column gutter `gutter` (`1.5rem`).
- **Mobile (≤ 767px):** 4-column grid, compact canvas margin `margin-mobile` (`1.25rem`), column gutter `gutter-sm` (`1rem`).

### Rhythm & Proportions
The layout leans on an 8pt architectural rhythm. Component internal padding maps strictly to the `space-*` tokens:
- **Card content:** `space-lg` (`1.5rem` / `24px`).
- **Section spacing:** Minimum `space-xl` (`2.5rem` / `40px`) vertical gap between analytical widgets to preserve focus during cognitive performance reviews.

## Elevation & Depth

Elevation eschews deep, saturated drop shadows in favor of ambient diffusion, translucency, and layered borders.

### The Light Spectrum
1. **Level 0 (Flat Canvas):** Clean `#FFFFFF` or `#F5F5F7` backdrop with zero elevation.
2. **Level 1 (Card & Modular Tile):** `#FFFFFF` fill with a `1px` solid border (`#E5E5EA`) and a feather-soft ambient shadow: `0px 2px 8px rgba(0, 0, 0, 0.04), 0px 12px 24px rgba(0, 0, 0, 0.02)`.
3. **Level 2 (Active Widget / Telemetry Flyout):** `0px 8px 30px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.04)` over a hairline border (`#E8E8ED`).
4. **Level 3 (Overlay & Modal HUD):** `0px 24px 60px rgba(0, 0, 0, 0.12)`.

### Frosted Glassmorphism
Navigation bars, sticky speech meters, and video overlay badges utilize background translucency:
- `backdrop-filter: blur(20px) saturate(180%)`
- Surface fill: `rgba(255, 255, 255, 0.72)` (Light mode) or `rgba(28, 28, 30, 0.65)` (Simulator dark mode).
- Stroke: `1px solid rgba(255, 255, 255, 0.3)` on light, or `1px solid rgba(255, 255, 255, 0.12)` on dark.

## Shapes

The geometric identity is defined by refined, continuous curvature mimicking Apple's squircle geometries.

- **Primary Cards & Containers:** Standardized at `20px` to `24px` border radius (`rounded-xl`), creating soft, ergonomic framing for technical graphs and live webcam streams.
- **Interactive Controls (Inputs, Form Rows):** `12px` to `14px` border radius (`rounded-lg`).
- **Action Buttons & Badges:** Full-pill execution (`rounded-full` / `9999px`) for CTA triggers, linguistic mode tags, and sentiment feedback chips.

## Components

### Buttons
- **Primary CTA:** Styled with the signature gradient `linear-gradient(135deg, #0071E3 0%, #7B61FF 100%)`, pure white text, full pill radius (`9999px`), padding `12px 24px`. Micro-hover transition: `opacity: 0.94`, `transform: scale(0.99)`.
- **Secondary / Ghost:** `#FFFFFF` background, `1px` border `#E5E5EA`, text `#1D1D1F`. Hover adds soft tint `rgba(0, 0, 0, 0.03)`.
- **Destructive Action:** Subtle red tint background `rgba(255, 59, 48, 0.08)`, text `#FF3B30`, border `1px solid rgba(255, 59, 48, 0.2)`.

### Chips & Telemetry Badges
- **Status Pills:** Height `24px` to `28px`, padding `0 12px`, pill radius.
- **Pace / Cadence Pill (Positive):** Fill `rgba(52, 199, 89, 0.1)`, text `#34C759`, border `1px solid rgba(52, 199, 89, 0.2)`.
- **Filler Word Alert:** Fill `rgba(255, 159, 10, 0.1)`, text `#FF9F0A`, border `1px solid rgba(255, 159, 10, 0.2)`.

### Cards & Analytical Modules
- Construct with pure `#FFFFFF`, `20px` border radius, `1px` border `#E5E5EA`.
- Internal sections separated by `1px solid #F5F5F7` hairline dividers.
- Hover states for interview session history cards lift via a subtle `transform: translateY(-2px)` and shadow expansion without border recoloring.

### Input Fields & Multilingual Selectors
- Background `#FFFFFF` or `#F5F5F7`, `12px` corner radius, `14px` vertical padding, `16px` horizontal padding.
- Hairline stroke `#E5E5EA`. Active state invokes focused Apple Blue border `#0071E3` with a soft optical ring: `0 0 0 3px rgba(0, 113, 227, 0.15)`.

### Behavioral & Acoustic Waveform Monitors (Domain-Specific)
- **Audio Dynamic Level Ribbon:** Smooth SVG canvas rendered with `#0071E3` to `#7B61FF` vertical gradient strokes.
- **Real-Time Sentiment Indicator:** Translucent floating glass capsule (`backdrop-filter: blur(16px)`), pill-shaped, pinned via absolute positioning inside the video feed with green/amber pulse nodes.