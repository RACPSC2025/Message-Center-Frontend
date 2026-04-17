# Design System Specification: Editorial Enterprise

## 1. Overview & Creative North Star

### The Creative North Star: "The Precision Curator"
This design system moves beyond the standard "utility dashboard" to create a high-end editorial experience for complex data. It is built for the professional who requires absolute clarity amidst high-density information. By combining the authoritative weight of a financial broadsheet with the fluid, layered depth of modern glassmorphism, we transform "data-heavy" into "data-sophisticated."

The design breaks traditional grid rigidity through **Intentional Asymmetry**. While the sidebar remains a dark, grounded anchor of status and navigation, the content area breathes with expansive white space, utilizing "stacked" surface layers instead of harsh lines to define the hierarchy.

---

## 2. Colors & Surface Philosophy

Our palette is anchored by a deep, authoritative teal and supported by a rigorous system of neutral surfaces.

### Core Tones
- **Primary (`#006971`)**: Our "Action Cyan." Used for primary interactions, active tab indicators, and progress status.
- **Surface (`#f8fafb`)**: The global canvas. A cool, crisp light gray that reduces eye strain.
- **Tertiary (`#b81d27`)**: Reserved strictly for critical alerts and delayed status indicators.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off major UI areas. 
- Boundaries must be defined by **background color shifts**. 
- Use `surface-container-low` for secondary toolbars and `surface-container-lowest` (#ffffff) for primary content cards.
- Layouts should feel like sheets of fine paper resting upon one another, not boxes drawn on a screen.

### Surface Hierarchy & Nesting
To create "nested depth," we use tiers:
1. **Level 0 (Base):** `surface` (#f8fafb) - The main background.
2. **Level 1 (Sub-navigation):** `surface-container-low` (#f2f4f5) - Used for filter bars and breadcrumbs.
3. **Level 2 (Data Containers):** `surface-container-lowest` (#ffffff) - Used for table bodies and main cards to make them "pop" forward.

### Glass & Gradient Transitions
To avoid a flat, "out-of-the-box" appearance:
- **Floating Elements:** Use `surface-container-highest` at 80% opacity with a `20px` backdrop-blur for modals or dropdowns.
- **Signature Textures:** Primary buttons should use a subtle vertical gradient from `primary_container` (#32bcc8) to `primary` (#006971) to provide a tactile, premium finish.

---

## 3. Typography

The typography strategy leverages **Manrope** for authoritative displays and **Inter** for high-readability data.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `display-md` for high-level status summaries (e.g., "67 Tareas").
*   **Title & Body (Inter):** A workhorse for data. `title-sm` is used for table headers and tab labels to ensure legibility at small scales.
*   **Labels (Inter):** `label-sm` is used for metadata, status tags, and micro-copy within tables.

**Editorial Hierarchy:** Always pair a bold `title-md` header with a `body-sm` description in a subtle `on_surface_variant` (#3c494c) to create a clear "Title/Caption" relationship common in editorial layouts.

---

## 4. Elevation & Depth

We achieve hierarchy through **Tonal Layering** and **Ambient Light Simulation**.

*   **The Layering Principle:** Place a `#ffffff` (Lowest) card on a `#f2f4f5` (Low) section. The slight shift in luminosity creates a natural "lift."
*   **Ambient Shadows:** For floating elements (e.g., the sidebar filter dropdowns), use a shadow with a blur of `32px`, offset `Y: 8px`, and an opacity of `6%` using the `on_surface` color. It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., in high-density tables), use the `outline_variant` (#bbc9cc) at **15% opacity**.
*   **Depth through Motion:** When hovering over table rows, transition the background to `surface-container-high` rather than adding a border.

---

## 5. Components

### Sidebar & Progress Rings
The sidebar is our "Command Center." Use `inverse_surface` (#2e3132) for the background. Circular progress indicators must use a thick stroke (`4px`) with `primary` (Teal), `yellow`, or `tertiary` (Red) to indicate status. The center of the ring should feature high-contrast `display-sm` typography.

### Complex Data Tables
*   **Status Circles:** Instead of text "Status," use 0% progress rings with color-coded strokes.
*   **Action Clusters:** Group action icons (speech bubbles, paperclips) in the leading columns. Use `on_surface_variant` for inactive icons, transitioning to `primary` on hover.
*   **No Dividers:** Separate rows with `8px` of vertical white space and a subtle background shift on the `surface-container-low` tier.

### Buttons & Inputs
*   **Primary Button:** Rounded `md` (0.375rem). Use the Signature Gradient.
*   **Filter Chips:** Use `secondary_container` with `on_secondary_container` text. Keep them pill-shaped (Rounded `full`).
*   **Inputs:** Use `surface_container_lowest` for the field background with a "Ghost Border" that clarifies on focus using a `primary` 2px bottom-stroke.

### Tabbed Navigation
Active tabs are indicated by a `2px` `primary` underline and a weight shift to Semi-Bold. Inactive tabs use `on_surface_variant` to recede into the background.

---

## 6. Do's and Don'ts

### Do
*   **Do** use expansive padding (minimum `24px`) around data containers to allow the "Editorial" feel to breathe.
*   **Do** use color intentionally. A red dot in a sea of teal and gray should be the most important thing on the screen.
*   **Do** stack containers (Lowest on Low) to create hierarchy.

### Don't
*   **Don't** use black (`#000000`) for text or shadows. Use `on_surface` (#191c1d) for text to maintain a premium, soft-black look.
*   **Don't** use 1px solid, 100% opaque borders to separate table rows or sidebar sections.
*   **Don't** use standard "system" fonts. Stick strictly to the Manrope/Inter pairing to maintain the custom editorial identity.