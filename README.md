# Contrast Lab

Contrast Lab is a web-based WCAG color contrast checker and color exploration workbench. It lets you edit a background/text pair, inspect the live contrast grade, preview the combination in realistic UI, generate accessible alternatives, and explore palettes, shades, harmonies, and monochromatic combinations.

All color calculations and UI interactions are implemented in the application code. The repository contains no database or application-specific API integration.

## Features

- **Background and text color editing** with an HSL picker and synchronized HEX input.
- **Contrast ratio and WCAG grading** with animated ratio updates and AA/AAA checks.
- **Live preview** with normal, large, and gradient text modes.
- **Auto Fix** to search for a high-contrast text color for the current background.
- **Random accessible pair** generation with a minimum contrast threshold of 4.5:1.
- **10 generated shades** for both the current background and text colors.
- **Fresh accessible pair carousel** with 10 generated AA-or-higher combinations.
- **Categorized color combinations** across Editorial, Tech, Luxury, Warm, Cool, and High Contrast.
- **Generated five-color palettes** with copy, background, and text actions.
- **Curated palette gallery** with predefined five-color palettes.
- **Tonal and monochromatic previews** derived from the active color.
- **Color harmonies** including Complementary, Analogous, Triadic, Tetradic, Split-Complementary, and Monochromatic.
- **Background suggestions** that meet a minimum 4.5:1 contrast ratio against the current text color.
- **Copy-to-clipboard actions** with in-app toast feedback.
- **Dynamic sitemap generation** at `/sitemap.xml`.
- **Responsive UI** built for desktop and mobile layouts.

## How It Works

1. `src/routes/index.tsx` owns the current `bg` and `text` color state.
2. The color pickers update that state through normalized HEX values.
3. `src/lib/contrastUtils.ts` performs contrast calculations, WCAG grading, shade generation, suggestions, palettes, color analysis, and harmony generation using `chroma-js`.
4. Feature components receive the current colors and expose `onApply` callbacks that update the main workbench.
5. The current pair is rendered immediately across the contrast hero, previews, shades, suggestions, and other sections.
6. The sitemap route builds its URLs from TanStack Router route metadata instead of maintaining a separate static XML file.

## Project Structure

```text
contrastlab-main/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives
│   │   └── *.tsx                  # Contrast Lab feature components
│   ├── hooks/
│   ├── lib/
│   │   ├── contrastUtils.ts       # Color/contrast algorithms and datasets
│   │   ├── sitemap.ts             # Sitemap helpers
│   │   └── utils.ts               # Shared utility helpers
│   ├── routes/
│   │   ├── __root.tsx              # Root document shell and metadata
│   │   ├── index.tsx               # Main application page
│   │   └── sitemap[.]xml.ts        # Dynamic sitemap endpoint
│   ├── routeTree.gen.ts            # Generated TanStack Router route tree
│   ├── router.tsx                  # Router setup and error handling
│   └── styles.css                  # Global styles and design tokens
├── .gitignore
├── .prettierignore
├── .prettierrc
├── bunfig.toml
├── bun.lockb
├── components.json
├── eslint.config.js
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc
```

## Requirements

- **Node.js 22.12.0 or newer**. The installed TanStack Start dependency requires Node.js 22.12+.
- **npm** for the setup commands below. The repository also contains a Bun lockfile, so use one package manager consistently when changing dependencies.
- A modern browser with JavaScript enabled.

## Installation and Setup

Clone the repository and install the locked dependencies:

```bash
git clone <repository-url>
cd contrastlab-main
npm ci
```

Start the development server:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Environment Variables and Secrets

No application-specific environment variables or secrets are required by the current source code. The only runtime environment check in the application is Vite's built-in `import.meta.env.DEV` flag for development-only error details.

Cloudflare local development may use `.dev.vars`, and that file is ignored by Git, but no current application code reads values from it.

## Usage and Execution

The main route is `/`. The workbench starts with a background and text color pair and updates all dependent sections when either color changes.

Typical workflow:

```text
Choose Background + Text
        ↓
Check Contrast Ratio / WCAG Grade
        ↓
Preview the pair in Live Preview
        ↓
Explore shades, harmonies, palettes, and suggestions
        ↓
Apply a generated or curated color pair
```

Key actions include:

- **Swap** exchanges background and text colors.
- **Auto Fix** calculates a higher-contrast text candidate for the current background.
- **Random** generates a random pair that reaches at least 4.5:1 when successful.
- **Shade strips** expose 10 generated tones and support applying/copying values.
- **Accessible pair cards** regenerate 10 fresh pairs after hydration.
- **Palette and harmony controls** apply colors directly back to the main workbench.
- **Copy** actions use the browser Clipboard API.

## GitHub Actions and Deployment

There is **no `.github/workflows/` directory** in the repository, so no GitHub Actions workflow is currently defined.

The project does contain Cloudflare deployment configuration:

- `wrangler.jsonc` defines the Cloudflare Worker configuration.
- `@cloudflare/vite-plugin` is included in the dependency set.
- The Vite configuration uses the repository's TanStack Start build configuration.

The repository does **not** define a `deploy` npm script. Use the Cloudflare/Wrangler tooling against the checked-in `wrangler.jsonc` configuration when deploying. Cloudflare credentials are external to the repository.

## Configuration

| File | Purpose |
|---|---|
| `package.json` | Dependencies and development/build/lint/format scripts |
| `package-lock.json` | npm dependency lockfile |
| `bun.lockb` | Bun dependency lockfile |
| `vite.config.ts` | Vite/TanStack Start configuration entry point |
| `wrangler.jsonc` | Cloudflare Worker configuration |
| `tsconfig.json` | TypeScript compiler configuration and `@/*` path alias |
| `eslint.config.js` | ESLint and TypeScript/React rules |
| `.prettierrc` | Prettier formatting rules |
| `components.json` | UI component alias and Tailwind/shadcn configuration |
| `public/robots.txt` | Crawler rules and sitemap location |
| `src/routes/index.tsx` | Page state, metadata, and feature composition |
| `src/lib/contrastUtils.ts` | Contrast/color algorithms and static color data |
| `src/lib/sitemap.ts` | Sitemap route discovery and XML generation |

### Public URL Configuration

The current canonical URL, Open Graph URL, and sitemap base URL are defined directly in the route source. When moving the site to another domain, update the corresponding values in:

```text
src/routes/index.tsx
src/routes/sitemap[.]xml.ts
public/robots.txt
```

## Troubleshooting

### `npm ci` or the build fails with a Node version error

Use Node.js 22.12.0 or newer, then reinstall dependencies:

```bash
node --version
npm ci
```

### `npm run dev` starts but the app does not load correctly

Remove the local dependency directory and reinstall from the lockfile:

```bash
rm -rf node_modules
npm ci
```

### Copy actions do not work

Clipboard operations use `navigator.clipboard`. Test in `localhost` during development or in a secure HTTPS deployment, and allow the browser's clipboard permission when prompted.

### Sitemap URLs point to an old domain

The sitemap is generated from the base URL in `src/routes/sitemap[.]xml.ts`, while the crawler entry is declared in `public/robots.txt`. Update both when changing domains.

### Production deployment is not configured through GitHub Actions

That is expected for this repository. There is no checked-in GitHub Actions workflow. Deployment configuration is kept in `wrangler.jsonc`.

## Testing and Validation

No automated unit/integration test runner or `test` script is defined in `package.json`. The repository's built-in validation commands are:

```bash
npm run lint
npm run build
```

Use both commands before committing changes. For UI changes, also run `npm run dev` and manually exercise color editing, WCAG scoring, clipboard actions, pair generation, palette application, and the sitemap endpoint.

## Maintenance

- Keep `package-lock.json` and `bun.lockb` consistent with intentional dependency changes.
- Run `npm run lint` and `npm run build` after source or dependency changes.
- Keep route `staticData.sitemap` metadata aligned with any new routes so sitemap generation stays correct.
- Update the hard-coded public URL locations when the deployment domain changes.
- Do not edit `src/routeTree.gen.ts` manually unless the TanStack Router workflow specifically requires it; it is generated route metadata.
- Keep `public/robots.txt` synchronized with the sitemap endpoint.
