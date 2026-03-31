# Universal Widget Settings Architecture

This document defines the standard pattern and instructions for implementing customizable settings across all Notion widgets in this project. All created widgets must adhere to these guidelines to ensure a consistent, predictable, and aesthetic user experience.

## The Goal
To provide a unified, general-purpose system allowing users to configure the appearance, size, color, style, and specific features of any widget before embedding it into Notion.

---

## 1. URL Parameter Driven State (The Source of Truth)
Since widgets are embedded in Notion via frames (`<iframe>`), the widget's configuration state **must be derived primarily from its URL parameters**.
- **Context:** The user configures a widget, copies the resulting URL, and pastes it into Notion. Notion loads that specific URL.
- **Pattern:** On page load (`DOMContentLoaded`), the widget script must parse `window.location.search` and apply the specified configuration.

### Common Standard URL Parameters
Every widget should ideally support these baseline parameters:
- `theme`: `light` (default) | `dark` | `system`
- `color`: Primary text/accent color. Predefined names or a HEX value without the hash (e.g., `3b82f6`).
- `cardColor`: Color for the main widget cards/surfaces. HEX value without the hash (e.g., `1f2937`).
- `bgColor`: Background color. HEX value without the hash or `transparent` (default).
- `borderColor`: Color for card/widget borders. HEX value without the hash (e.g., `000000`).
- `borderWidth`: `0px` (default) | `1px` | `2px` | `4px`
- `font`: `sans-serif` (default) | `serif` | `monospace` | or a specific Google Font name (e.g., `inter`, `oswald`)
- `size`: `sm` | `md` (default) | `lg`
- `radius`: `none` | `sm` | `md` (default) | `lg` | `full`
- `language`: `en` (default) | `id` (and any other supported locales)

*Note: Widgets will also have their own specific state parameters (e.g., `<boolean>Toggle=true|false` or `format=12h|24h`).*

---

## 2. The Settings UI Overlay
Every widget requires a built-in settings interface that allows users to customize it visually and generate the embed link.

### UI / UX Behavior:
1. **Trigger:** A subtle "Gear" (⚙️) icon or "Settings" button pinned to a corner (usually top-right). It should fade out or be hidden when the widget is embedded inside Notion (detectable if `window.self !== window.top` or via a specific `?embed=true` parameter), though providing it even in embeds can be useful if designed well.
2. **Settings Panel:** Clicking the trigger opens a clean, modern off-canvas menu, modal, or floating panel over the widget.
3. **Real-time Preview:** As the user adjusts toggles, dropdowns, and color pickers in the UI, the widget's appearance updates *instantaneously*.
4. **URL Generation:** As settings change, an "Embed URL" text field automatically updates. The user copies this link to paste into Notion.

### Suggested HTML Structure
```html
<!-- Widget Content Here -->
<div id="widget-root">...</div>

<!-- Settings UI over top -->
<button id="settings-trigger" class="settings-btn" aria-label="Open Settings">
  <svg>...</svg>
</button>

<aside id="settings-panel" class="settings-panel hidden">
  <div class="settings-header">
    <h2>Customize</h2>
    <button id="close-settings">×</button>
  </div>
  
  <div class="settings-content">
    <!-- General Settings -->
    <div class="setting-group">
      <label for="theme-select">Theme</label>
      <div class="select-wrapper">
        <select id="theme-select">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>

    <div class="setting-group">
      <label for="color-input">Text/Accent Color</label>
      <div class="input-row">
        <input type="color" id="color-picker-input">
        <input type="text" id="color-input" placeholder="e.g. 3b82f6" maxlength="6">
      </div>
    </div>
    
    <!-- Other layout blocks for cardColor, bgColor, borderColor, borderWidth, language, font, etc. -->
    
    <!-- Widget Specific Settings (like toggles) Go Here -->
    <div class="setting-group checkbox-group">
      <label class="toggle">
        <input type="checkbox" id="feature-toggle">
        <span class="slider"></span>
      </label>
      <span class="label-text">Enable Feature</span>
    </div>
    
  </div>
  
  <div class="settings-footer">
    <div id="embed-warning" class="embed-warning hidden">
      ⚠️ Settings changed! You must click Copy below and "Replace" the embed link in Notion to save.
    </div>
    <label for="embed-url">Notion Embed URL</label>
    <div class="url-copy-group">
      <input type="text" id="embed-url" readonly />
      <button id="copy-btn">Copy</button>
    </div>
    <p class="help-text">Copy link & paste into Notion as an Embed.</p>
    
    <div class="sidebar-credits">
      <p>Created by <strong>yourname</strong></p>
      <a href="#" target="_blank" class="donate-btn">
        ☕ Buy me a coffee / Donate
      </a>
    </div>
  </div>
</aside>
```

### Standard Settings UI Dimensions
To maintain a consistent and compact footprint across all widgets, ensure the settings panel strictly adheres to these CSS dimensions and spacing (as refined in the Flip Clock widget):
- **Panel Width**: `width: 100%; max-width: 380px;`
- **Header Padding**: `12px 16px`
- **Content & Footer Padding**: `16px` (with a `12px` gap between setting groups)
- **Input/Select Controls**: `padding: 6px 10px; font-size: 0.85rem;`
- **Labels & Microcopy**: `font-size: 0.75rem;`

---

## 3. Implementation Guidelines for Development
When writing the JavaScript logic for any widget, follow this strict procedure to integrate settings:

1. **State Definition:** Define default settings in a central JS configuration object.
2. **URL Parsing:** Read `URLSearchParams`. For every parameter found, validate it, and overwrite the default state.
3. **Apply State to CSS:** Inject configuration into the DOM using CSS Custom Properties (Variables) on the `:root` or `body` element.
   - Example: `document.documentElement.style.setProperty('--primary-color', state.color);`
   - By mapping state strictly to CSS variables, real-time preview updates require merely changing those inline CSS variables rather than manually updating lots of DOM class lists manually.
4. **Hydrate UI Controls:** Set the value of the settings panel inputs (sliders, selects, checkboxes) to match the current state.
5. **Attach Event Listeners:** Connect the settings inputs to handle user interactions:
   - Update the configuration state object.
   - Update the CSS variable (updates the preview).
   - Update the browser URL without reloading using `history.replaceState(...)`.
   - Re-generate the "Embed URL" string and update the copy field.

## 4. Shared CSS Variables Pattern
Use a standard set of CSS variables inside the widget's stylesheet to make theming predictable across the library.

```css
:root {
  --bg-color: transparent;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --accent-color: #3b82f6;
  
  /* Shared Widget Structural Variables */
  --card-bg: #3b82f6; 
  --card-border: #000000;
  --border-width: 0px;
  --border-radius: 12px;
  
  --font-family: 'Inter', system-ui, sans-serif;
  
  /* Additional tokens */
}

body.dark {
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --accent-color: #60a5fa;
  /* Dark mode overrides if --bg-color or --card-bg are typically unset */
}

/* Use these variables throughout the widget styling */
```

## 5. Security & Validation Checks
- **Sanitize Input:** Always validate configuration parameters. If a color parameter expects a HEX code, verify it matches `/^[0-9A-Fa-f]{6}$/`.
- **Fail Gracefully:** If an invalid URL parameter is passed, silently ignore it and use the default value rather than breaking the widget render.
