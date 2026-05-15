# Design Document

## React Portfolio Migration

### Overview

This design covers migrating the existing static iPortfolio HTML/CSS/JS site to a React + Vite application. The **primary constraint** is pixel-perfect visual fidelity — every layout, animation, interaction, and responsive behavior must be identical to the current site.

The strategy is **wrapping, not rewriting**: React components will render the exact same HTML structure that exists today. The existing `assets/` directory (CSS, images, vendor libraries) is preserved in `public/` so all paths remain unchanged. Vendor libraries (AOS, Typed.js, GLightbox, Isotope, Swiper, PureCounter, Waypoints) are initialized inside `useEffect` hooks after the DOM is mounted, replicating the `window.addEventListener('load', ...)` pattern from `main.js`.

---

### Architecture

```
react-portfolio/
├── public/
│   └── assets/               ← copied verbatim from current site
│       ├── css/main.css
│       ├── img/
│       ├── vendor/
│       └── js/validate.js    ← kept for reference only
├── src/
│   ├── main.jsx              ← mounts <App />
│   ├── App.jsx               ← composes all sections + global effects
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Stats.jsx
│   │   ├── Skills.jsx
│   │   ├── Resume.jsx
│   │   ├── Portfolio.jsx
│   │   ├── Services.jsx
│   │   ├── Testimonials.jsx
│   │   ├── Contact.jsx
│   │   └── Footer.jsx
│   └── hooks/
│       └── useScrollSpy.js   ← active nav link tracking
├── index.html                ← Vite entry; loads vendor CSS + fonts
└── vite.config.js
```

**Key architectural decisions:**

- Vendor JS/CSS files stay in `public/assets/vendor/` and are loaded via `<script>` / `<link>` tags in `index.html`, exactly as the static site does. This avoids npm-bundling them and guarantees identical behavior.
- `assets/css/main.css` is loaded via `<link>` in `index.html` — never imported through JS — so CSS specificity and cascade are unchanged.
- No React Router. The site is a single scrollable page; hash links (`#hero`, `#about`, …) work natively.
- Global scroll effects (scroll-top button, navmenu scrollspy, preloader removal) live in `App.jsx` inside a single `useEffect` that mirrors the IIFE in `main.js`.

---

### Components and Interfaces

#### `index.html` (Vite entry)

Loads all external resources in the same order as the static site:

```html
<!-- Fonts (Google Fonts) -->
<!-- Vendor CSS: bootstrap, bootstrap-icons, aos, glightbox, swiper -->
<!-- Main CSS: /assets/css/main.css -->
<!-- body: <div id="root"></div> -->
<!-- Vendor JS: bootstrap.bundle, aos, typed.umd, purecounter, waypoints,
               glightbox, imagesloaded, isotope, swiper -->
<!-- React bundle injected by Vite -->
```

Vendor scripts are placed **before** the React bundle so `window.AOS`, `window.Typed`, etc. are available when `useEffect` hooks run.

#### `App.jsx`

```jsx
function App() {
  // Global effects — mirrors main.js IIFE
  useEffect(() => {
    // 1. Header toggle
    // 2. Hide mobile nav on hash link click
    // 3. Preloader removal on load
    // 4. Scroll-top button visibility + click
    // 5. AOS.init()
    // 6. PureCounter init
    // 7. GLightbox init
    // 8. Isotope init (with imagesLoaded)
    // 9. Swiper init
    // 10. Navmenu scrollspy (scroll + load)
    // 11. Hash scroll correction on load
  }, []);

  return (
    <>
      <Header />
      <main className="main">
        <Hero />
        <About />
        <Stats />
        <Skills />
        <Resume />
        <Portfolio />
        <Services />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
        <i className="bi bi-arrow-up-short"></i>
      </a>
      <div id="preloader"></div>
    </>
  );
}
```

#### `Header.jsx`

Renders the fixed sidebar verbatim. The `header-toggle` button and `header-show` class toggling are handled in `App.jsx`'s global effect (same as `main.js`), so no local state is needed in this component.

```jsx
// Renders: <header id="header" class="header dark-background d-flex flex-column">
//   profile-img, logo, social-links, navmenu
// </header>
```

#### `Hero.jsx`

```jsx
// Renders the hero section HTML exactly.
// Typed.js is initialized in App.jsx's useEffect (already handles .typed selector).
```

#### `Skills.jsx`

```jsx
// Renders .skills-animation container.
// Waypoints initialization in App.jsx useEffect reads .skills-animation
// and animates .progress-bar width from aria-valuenow.
```

#### `Portfolio.jsx`

```jsx
// Renders .isotope-layout with filters and .isotope-container.
// Isotope + imagesLoaded initialized in App.jsx useEffect.
```

#### `Testimonials.jsx`

```jsx
// Renders .init-swiper with embedded <script type="application/json" class="swiper-config">.
// Swiper initialized in App.jsx useEffect via initSwiper() logic.
```

#### `Contact.jsx`

Handles form submission via `fetch` to Formspree. Shows loading/error/success divs by toggling their `display` style — matching the CSS classes `.loading`, `.error-message`, `.sent-message` already defined in `main.css`.

```jsx
const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
```

---

### Data Models

All content is static and co-located in each component as plain JS constants. No external data fetching or state management library is needed.

```js
// Example — Skills.jsx
const skills = [
  { name: 'HTML',         value: 100 },
  { name: 'Tailwind CSS', value: 90  },
  { name: 'JavaScript',   value: 75  },
  { name: 'Java',         value: 80  },
  { name: 'Python',       value: 90  },
  { name: 'FullStack',    value: 60  },
];

// Example — Stats.jsx
const stats = [
  { icon: 'bi-people',          end: 2,   label: 'Position of Responsibility', ... },
  { icon: 'bi-journal-richtext', end: 4,  label: 'Projects', ... },
  { icon: 'bi-award',           end: 5,   label: 'Awards', ... },
  { icon: 'bi-code',            end: 900, label: 'Total Questions Solved', ... },
];
```

**Contact form state:**

```ts
{
  name: string,
  email: string,
  subject: string,
  message: string,
  status: 'idle' | 'loading' | 'success' | 'error'
}
```

---

### Vendor Library Integration

All vendor libraries are globals loaded via `<script>` tags in `index.html`. They are initialized in a single `useEffect(() => { ... }, [])` in `App.jsx` after the first render, which is equivalent to `window.addEventListener('load', ...)` in the static site.

| Library       | Global        | Init pattern in useEffect                                      |
|---------------|---------------|----------------------------------------------------------------|
| AOS           | `window.AOS`  | `AOS.init({ duration:600, easing:'ease-in-out', once:true })`  |
| Typed.js      | `window.Typed`| `new Typed('.typed', { strings, loop, typeSpeed, ... })`       |
| PureCounter   | `window.PureCounter` | `new PureCounter()`                                     |
| Waypoints     | `window.Waypoint` | `new Waypoint({ element, offset:'80%', handler })`         |
| GLightbox     | `window.GLightbox` | `GLightbox({ selector: '.glightbox' })`                   |
| Isotope       | `window.Isotope` | `new Isotope(container, { itemSelector, layoutMode, ... })` |
| imagesLoaded  | `window.imagesLoaded` | wraps Isotope init                                   |
| Swiper        | `window.Swiper` | `new Swiper(el, JSON.parse(el.querySelector('.swiper-config').innerHTML))` |

**Cleanup:** The `useEffect` returns a cleanup function that destroys Typed, GLightbox, Isotope, and Swiper instances to prevent memory leaks on hot-reload during development.

```js
useEffect(() => {
  let typedInstance, glightboxInstance, isotopeInstances = [], swiperInstances = [];

  // ... init all libraries ...

  return () => {
    typedInstance?.destroy();
    glightboxInstance?.destroy();
    isotopeInstances.forEach(i => i.destroy());
    swiperInstances.forEach(s => s.destroy());
  };
}, []);
```

---

### Asset Management Strategy

Assets are placed in `public/assets/` so Vite serves them at `/assets/...` — identical to the static site's paths. No import statements are needed for images or CSS.

```
public/
  assets/
    css/main.css
    img/
      hero-bg.jpg
      my-profile-img.jpg
      portfolio/app-1.jpg  ...
      testimonials/testimonials-1.jpg  ...
    vendor/
      aos/
      bootstrap/
      bootstrap-icons/
      glightbox/
      imagesloaded/
      isotope-layout/
      purecounter/
      swiper/
      typed.js/
      waypoints/
```

In JSX, image `src` attributes use the same relative paths as the static HTML:

```jsx
<img src="assets/img/my-profile-img.jpg" ... />
```

Vite's `base: './'` config ensures these paths resolve correctly in both dev and production builds.

---

### Vite Configuration

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

`package.json` dependencies:

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4",
    "vite": "^5"
  }
}
```

No npm packages for vendor libraries — they are loaded from `public/assets/vendor/` as script tags.

---

### Navigation and Scroll State

The `header-show` class toggle and navmenu scrollspy are implemented in `App.jsx`'s `useEffect`, directly porting the logic from `main.js`:

```js
// Header toggle
const headerToggleBtn = document.querySelector('.header-toggle');
const headerToggle = () => {
  document.querySelector('#header').classList.toggle('header-show');
  headerToggleBtn.classList.toggle('bi-list');
  headerToggleBtn.classList.toggle('bi-x');
};
headerToggleBtn.addEventListener('click', headerToggle);

// Close on nav link click (mobile)
document.querySelectorAll('#navmenu a').forEach(a =>
  a.addEventListener('click', () => {
    if (document.querySelector('.header-show')) headerToggle();
  })
);

// Scrollspy
const navmenuScrollspy = () => {
  document.querySelectorAll('.navmenu a').forEach(link => {
    if (!link.hash) return;
    const section = document.querySelector(link.hash);
    if (!section) return;
    const pos = window.scrollY + 200;
    if (pos >= section.offsetTop && pos <= section.offsetTop + section.offsetHeight) {
      document.querySelectorAll('.navmenu a.active').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};
window.addEventListener('load', navmenuScrollspy);
document.addEventListener('scroll', navmenuScrollspy);
```

This is a direct port — no React state is used for navigation, preserving the exact same DOM manipulation behavior.

---

### Error Handling

**Contact form:** Uses `fetch` with try/catch. The three status divs (`.loading`, `.error-message`, `.sent-message`) are shown/hidden via React state mapping to inline `display` styles, matching the CSS expectations in `main.css`.

```jsx
<div className="loading" style={{ display: status === 'loading' ? 'block' : 'none' }}>Loading</div>
<div className="error-message" style={{ display: status === 'error' ? 'block' : 'none' }}>{errorMsg}</div>
<div className="sent-message" style={{ display: status === 'success' ? 'block' : 'none' }}>
  Your message has been sent. Thank you!
</div>
```

**Vendor library availability:** Each library init is guarded with a `typeof window.LibraryName !== 'undefined'` check to prevent errors if a script fails to load.

**Build errors:** Vite provides HMR with clear browser overlay error messages during development.

---

### Testing Strategy

This feature is a UI migration — the primary concern is visual and behavioral fidelity, not algorithmic correctness. The codebase consists of:

- Static JSX rendering existing HTML structure
- DOM manipulation via `useEffect` (direct port of `main.js`)
- A single form submission handler

PBT is **not appropriate** here. There are no pure functions with meaningful input spaces to explore. The correctness guarantees are:
1. The rendered HTML matches the static site structure
2. Vendor libraries initialize correctly after mount
3. The contact form submits and handles responses correctly

**Testing approach:**

- **Snapshot tests**: Render each component and assert the HTML structure matches expected output. Catches regressions if JSX is accidentally modified.
- **Example-based unit tests** (Vitest + React Testing Library):
  - Contact form: test loading state, success state, error state with mocked `fetch`
  - Header toggle: test `header-show` class toggling
  - Scrollspy: test active class assignment based on scroll position
- **Visual regression tests** (optional, Playwright or Storybook): Screenshot comparison against the static site for pixel-perfect verification
- **Manual smoke testing**: Load the React app and the static site side-by-side; verify all sections, animations, and interactions are identical

