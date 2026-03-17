# GitHub Copilot Workspace Instructions

## Project overview

- Next.js 15 + React 19 + TypeScript front-end app.
- Layouts in `src/app`; UI components in `src/components`; pages in `src/page`.
- Redux tool-kit in `src/redux`; Zustand stores in `src/stores`.
- Internationalization with `next-intl` and messages in `messages/`.
- Styling: Tailwind + Mantine + Emotion.

## Core workflows

- `npm run dev`: development server
- `npm run build`: production build
- `npm run start`: run built app
- `npm run lint`: lint checks

## Agent behavior and conventions

- Prefer updates under `src/` only.
- Keep components composable and small (single concern).
- Use function components + hooks.
- Add/extend types in `src/types/`.
- Follow existing `camelCase` naming for helpers and `PascalCase` for components.
- Prefer `async/await` for API calls and `try/catch` for error handling.

## Code patterns

- `src/api/core.api.ts` for HTTP wrapper.
- `src/components/*` are reusable UI pieces, `src/page/*` are page views.
- `src/layouts/*` expose structural layout wrappers for auth/admin/client.

## Tasks and testing

- For bug fixes, indicate exact page/route (e.g., `/page/admin/user`).
- For feature additions, include UI + state update + API integration steps.

## When in doubt

- Keep PR scope minimal.
- For new pages, mimic `src/page/home` and `src/components/*.tsx` patterns.
- If API contract unknown, refer to existing `src/api/actions` and `src/api/tantask` files.

## Suggested prompts

- "Create a new admin page at `src/page/admin/reports` with table columns X/Y/Z and server data fetching from `GET /api/admin/reports`."
- "Refactor `src/components/chat/ChatBox.tsx` to use `useMemo` for render optimizations and add loading skeleton."
- "Add i18n support for Vietnamese in `src/page/profile` and update `messages/vi.json` entries."

## Next agent-customization ideas

- `/create-agent frontend` for UI-only tasks (supply `applyTo: src/page/**` + `src/components/**`).
- `/create-instruction lint-fix` for targeted ESLint + formatting guidance.
- `/create-prompt fast-feedback` to generate quick markup/TS suggestions for small UX issues.

---

applyTo: "\*\*"
excludeAgent: "code-agent"

---

## Mandatory coding constraints

- Write code that is easy to read and understand; avoid “clever” tricks.
- Do not cram logic into one function. Prefer small, focused functions and clear separation of concerns.
- Prefer reuse: search and reuse existing helpers/hooks/services/components first; create new only when missing.
- Follow the existing code style and structure in this repository (naming, folder structure, patterns, formatting).
- Use descriptive variable/function names; avoid unclear abbreviations.

## TypeScript & safety

- Do not use `any`. Keep types strict.
- Always handle `null | undefined` safely (optional chaining, defaults, guards).
- Prefer explicit types for function boundaries (inputs/outputs), especially for shared utilities and services.
- If a value is unknown, use `unknown` + type guards instead of `any`.

## Dependency discipline

- Use library APIs that match the exact versions in `package.json`.
- Do not introduce new dependencies unless explicitly requested.
- If a solution depends on a newer API not available in the current version, propose an alternative compatible approach.

## Comments (Vietnamese, minimal)

- Always add short Vietnamese comments for critical decisions (WHY), but keep them minimal.
- WHAT-comments are allowed only as brief one-liners (labels), e.g. "// Map API DTO -> UI model".
- Do not write long explanatory comments or duplicate what the code already makes obvious.
- Do not restate existing comments. Avoid redundant comments.
- Treat existing comments as helpful hints only; do not rely on them if they conflict with the code.

## Response style (token-efficient)

- Respond in Vietnamese.
- Be concise. Provide only what is necessary to implement the change.
- Prefer minimal patches/snippets instead of full-file outputs.
- Only output full files when explicitly requested.
