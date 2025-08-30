# Repository Guidelines

## Project Structure & Module Organization
- app/: Next.js App Router (e.g., app/page.tsx, app/layout.tsx) and API routes under app/api/<name>/route.ts.
- components/: Reusable React components (UI primitives under components/ui/, chat under components/ai/).
- lib/: Utilities and prompt loading logic (e.g., lib/prompts.ts) with path alias `@/*`.
- hooks/: React hooks (e.g., hooks/use-mobile.ts).
- prompts/: System prompts for chat and code generation (game-planning.txt, code-generation.txt).
- Styling: Tailwind CSS v4 via app/globals.css and PostCSS.

## Build, Test, and Development Commands
- npm run dev: Start local dev server with Turbopack at http://localhost:3000.
- npm run build: Production build.
- npm run start: Start the production server.
- npm run lint: Run ESLint (Next.js core-web-vitals rules).
Tip: pnpm/yarn/bun equivalents also work (see README).

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode). Prefer function components and hooks.
- Indentation: 2 spaces; keep files small and focused.
- Filenames: kebab-case (e.g., web-preview.tsx, app-sidebar.tsx). Exported React components use PascalCase.
- Hooks: start with use- (e.g., use-mobile.ts) and live in hooks/.
- API routes: app/api/<route>/route.ts with small, focused handlers.
- Linting: ESLint with next/core-web-vitals and next/typescript. Run lint before PRs.
- Styling: Tailwind utility-first; co-locate component styles in the component or globals when app-wide.

## Testing Guidelines
- No test framework is configured yet. For contributions adding tests, prefer Vitest + Testing Library for React components and Playwright for basic e2e.
- Place unit tests alongside files (filename.test.ts/tsx) or in a __tests__/ sibling folder.

## Commit & Pull Request Guidelines
- Commits: Use Conventional Commits (e.g., feat: add web preview; fix: handle missing API key; chore: deps).
- PRs: Include a clear description, rationale, and screenshots/GIFs for UI. Link issues, list breaking changes, and add test notes.
- Keep PRs focused; split large changes into reviewable chunks.

## Security & Configuration Tips
- Environment: Set OPENAI_API_KEY in .env.local (ignored by git). Do not commit secrets.
- Error handling: API routes should guard against missing env and return meaningful HTTP statuses.
- Prompts: Update prompts/*.txt thoughtfully; changes affect model behavior. In dev, prompts hot-reload via lib/prompts.ts.
