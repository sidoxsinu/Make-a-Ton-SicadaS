# 05. Design System

Intent: a ledger. Dense, ruled, quiet, readable. The interface is a working document for people who read numbers all day, so every element carries information and nothing is there to decorate.

## 1. Banned list (binding, checked by script)

| Banned | Rule applied here |
|---|---|
| Gradients, radial orbs, glows, glass, blur, drop shadows | Flat fills and 1px rules only. No `box-shadow`, `filter: blur`, `backdrop-filter`, `gradient`. |
| Emojis, stock icon sets, sparkle icons, arrows with motion cues | No icons at all. Navigation and buttons are text. Sorting is shown with the words asc and desc. |
| Inter, Geist, Space Grotesk | IBM Plex Sans and IBM Plex Mono. |
| Dot grids, bento grids, rows of 3 equal cards, colored left stripe cards | Layouts are ruled tables, split panes and definition lists. No cards. |
| Purple, rainbow, neon, basic pastels, pure white | Muted paper and ink palette below. Backgrounds are never `#fff`. |
| Rounded corners above 2px | Maximum radius is 2px. Tailwind radius scale is overridden. |
| Terminal windows, checkmark bullets, confetti, plane illustrations | None. Lists use plain markers or numbers. |
| Em dashes and "it is not X, it is Y" phrasing | Copy uses commas, colons and hyphens. Review all strings. |
| Placeholder or fake testimonials, stats, filler marketing text | Empty states state facts. No sample copy ships. Seed data is labelled test data and is removed from production. |
| Decorative filler shapes | If an element carries no information it is deleted. |

## 2. Tokens

```css
:root {
  --paper:        #EFEBE2;  /* page background */
  --sheet:        #F7F4EC;  /* panels, inputs, table body */
  --hover:        #E7E2D6;  /* row hover */
  --selected:     #DCD6C6;  /* selected row, current nav item */
  --ink:          #1B1F23;  /* primary text, strong rules */
  --ink-2:        #4B525A;  /* secondary text */
  --rule:         #CBC4B4;  /* hairlines */
  --rule-strong:  #8C8676;  /* input borders */
  --accent:       #1E4D5C;  /* primary action, current state, chart series */
  --accent-ink:   #F7F4EC;
  --ok:           #2D6A3E;
  --warn:         #85560A;
  --bad:          #9B2C25;
  --radius:       2px;
}
```
Contrast check (must be at least 4.5 to 1 for text): ink on paper, ink-2 on paper, accent on paper, ok, warn and bad on sheet. Verify with a contrast tool during Phase 0 and darken a token if one fails. Dark mode is out of scope.

Tailwind config: map colors to the variables, set `borderRadius: { none: '0', DEFAULT: '2px', sm: '2px', md: '2px', lg: '2px', xl: '2px', '2xl': '2px', '3xl': '2px', full: '2px' }`, set `boxShadow: { none: 'none' }` and `dropShadow: {}`.

## 3. Typography

| Use | Font | Size and weight |
|---|---|---|
| Body, labels | IBM Plex Sans | 14px, 400 |
| Table cells | IBM Plex Sans | 13px, 400 |
| Numbers, money, IDs, dates in tables | IBM Plex Mono, `font-variant-numeric: tabular-nums` | 13px, 400 |
| Table header | IBM Plex Sans | 12px, 600, ink-2 |
| Page title | IBM Plex Sans | 20px, 600 |
| Section title | IBM Plex Sans | 14px, 600 |
| KPI value | IBM Plex Mono | 24px, 500 |
| Badge | IBM Plex Sans | 11px, 600, uppercase, letter spacing 0.04em |

Line height 1.4. Self host through fontsource with weights 400, 500, 600 only.

## 4. Layout

- Shell: left rail 232px (text navigation grouped under Sell, Billing, Catalog, People, Admin), top bar 48px with page title and the user email plus Sign out, content area padding 24px. Rail and top bar separated by 1px ink rules.
- Navigation shows only what the role may open. Current item uses `--selected` background.
- Lists: filter bar on top (inline fields, one row), table below, pager under the table with "Showing 1 to 25 of 10,240" and Previous, Next as text buttons.
- Detail pages: two columns. Left, the record fields and line items. Right, status stepper, totals ledger, history. Columns divided by a 1px rule, widths 2 to 1.
- Forms: single column, max width 560px, label above field. Long forms are split into sections with a section title and a 1px rule.
- Spacing scale 4, 8, 12, 16, 24, 32, 48. Table row height 36px. Control height 36px.
- Portal shell uses the same components with a top bar navigation instead of the rail.
- Responsive: below 900px the rail collapses into a text menu button. Tables scroll horizontally inside their own container.

## 5. Component visuals

| Component | Visual spec |
|---|---|
| Button primary | `--accent` fill, `--accent-ink` text, 2px radius, 36px high, 600 weight |
| Button secondary | 1px `--ink` border, transparent fill |
| Button quiet | text with 1px underline |
| Button danger | `--bad` text, 1px `--bad` border |
| Disabled | `--ink-2` text, 1px `--rule` border, no fill, cursor not-allowed |
| Focus | 2px `--accent` outline, 2px offset, on every interactive element |
| Field | Label 12px ink-2 above. Input on `--sheet`, 1px `--rule-strong`, 2px radius. Error: border `--bad`, message in `--bad` below. Help text 12px ink-2 |
| Table | Header bottom border 1px ink. Row bottom border 1px rule. Numeric columns right aligned mono. Row hover `--hover`. Sort state announced with `aria-sort` and the words asc or desc after the header text |
| Badge | No fill. 1px border and text in the status color. Status map below |
| Drawer | Right side, 480px, `--sheet`, 1px ink left border, scrim is solid `rgba(27,31,35,0.35)`. Closes with the text button Close and Escape |
| Dialog | Centered, 480px, 1px ink border, 2px radius, no shadow. Used only for destructive confirmation |
| Toast | Bottom left, `--sheet`, 1px ink border. Error toast border `--bad`. Auto dismiss after 6 seconds, errors stay until closed |
| KpiLedger | Definition table: label left, value right in mono 24px, context text under the value in ink-2. Rows ruled with 1px rule. No cards |
| BarSeries | SVG. Bars `--accent`, baseline 1px ink, gridlines 1px `--rule`, axis labels mono 11px ink-2, value labels printed above bars in mono 11px. Single series, no legend. Two series use `--accent` and `--warn` with a text legend |
| StateStepper | Horizontal row of labelled rectangles. Past steps `--ink` fill with paper text. Current step `--accent` fill. Future steps outlined 1px rule-strong. Labels are the state names. No arrows, no check glyphs |
| LineItemsEditor | Ruled table with inline inputs, row remove as text button "Remove", footer row with "Add line" text button and totals right aligned |
| EmptyState | One sentence naming what is missing and one primary button when the user can create it. No illustration |

Status colors:

| State | Color |
|---|---|
| Draft | ink-2 |
| Quotation | accent |
| Confirmed | accent |
| Active | ok |
| Paused | warn |
| Closed | ink-2 |
| Cancelled | ink-2 |
| Paid | ok |
| Overdue | bad |
| Partial | warn |

## 6. Motion (GSAP)

All GSAP code lives in `lib/motion.ts`. Components call hooks. Motion shows change of state or arrival of data and is short.

| Hook | Used by | Effect | Timing |
|---|---|---|---|
| `useReveal(ref)` | Page content on route change | Opacity 0 to 1 and 6px rise | 0.2s, `power2.out`, once per navigation |
| `useStagger(ref, selector)` | First 20 table rows after data arrives | Opacity 0 to 1, 0.02s stagger | 0.18s per row, total under 0.6s |
| `useCountUp(ref, value, format)` | KpiLedger values | Number tween from previous value to new value | 0.6s, `power1.out`, runs on load and when filters change |
| `useStepperFill(ref, index)` | StateStepper | Current step fill scales on X from 0 to 1 when the state changes | 0.3s, `power2.out` |
| `useDrawer(ref, open)` | Drawer | Slide on X from 100 percent to 0 | 0.25s, `power2.out` |
| `useDrawSeries(ref)` | BarSeries | Bars scale on Y from 0 to full, 0.03s stagger | 0.4s, `power2.out`, once per data load |

Rules:
1. `gsap.matchMedia()` with `(prefers-reduced-motion: reduce)` skips every tween and sets final values immediately.
2. Content is visible without JavaScript. Hooks set the hidden start state only after hydration, so a failed script never leaves a blank page.
3. Use `useGSAP` from `@gsap/react` with a scope ref so every tween is reverted on unmount.
4. Animate only transform and opacity, plus number text for the count up.
5. No looping animation, no hover wiggle, no animated arrows.
6. Never delay the display of data for animation. Stagger starts when rows are already in the DOM.

## 7. Content rules

- Labels are nouns (Customer, Plan, Due date). Buttons are verbs (Confirm invoice, Record payment).
- Dates display as 31 Oct 2026. Money uses `Intl.NumberFormat('en-IN', { style: 'currency', currency })` through the `Money` component. Percent as 18%.
- Status words are the exact state names from the statement.
- Errors say what to do. Example: "Add a special character."
- No exclamation marks, no emojis, no em dashes, no contrast phrasing of the form "not X, but Y".
- Login page shows the app name, the form, and links for sign up and forgot password. Nothing else.
- Print stylesheet for invoices: `--paper` background removed to transparent, black ink, Plex Sans 11pt, company name, invoice number, customer, period, lines table, totals ledger, payment terms, due date. No navigation.

## 8. Accessibility

- Every input has a visible label. Errors are tied with `aria-describedby`.
- Tables use `table`, `thead`, `th scope`. Sortable headers are buttons inside `th`.
- Status is never color only. The state name is always written.
- Keyboard: Tab order follows reading order, Escape closes drawers and dialogs, focus returns to the trigger.
- Reduced motion respected through the single guard in `lib/motion.ts`.

## 9. Enforcement script

`scripts/check-bans.mjs` fails the build when it finds in `app`, `components`, `lib`, `styles` (excluding `node_modules`): `gradient`, `box-shadow`, `shadow-`, `blur`, `backdrop`, Tailwind rounded classes above `rounded-sm` (`rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`), the font names Inter, Geist, Space Grotesk, the em dash character, `#fff`, `#ffffff`, `white` as a color, `lucide`, `react-icons`, `heroicons`, and emoji ranges. Run in CI and before every phase commit with `npm run check:bans`.
