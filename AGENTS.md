# On The Hook Repository Agent Rules

This npm-workspace monorepo currently contains one iOS React Native application.
Future apps and packages belong under `apps/` and `packages/`; do not introduce
alternate package managers.

## Repository Standards

- Use Node.js 22, npm workspaces, and strict TypeScript. `.nvmrc`,
  `package.json`, and `package-lock.json` are the tooling source of truth.
- Organize application code by business feature, not broad technical folders.
- Keep native iOS changes under `apps/mobile/ios/`; app behavior belongs in
  TypeScript under `apps/mobile/src/`.
- Preserve unrelated changes in a dirty worktree.
- Use Conventional Commits when asked to commit:
  `<type>(<scope>): <description>`. Use `oth` or `ios` as appropriate.

## Working Checklist

1. Read this file and `apps/mobile/AGENTS.md` before changing the iOS app.
2. Capture `git status --short` before multi-step work.
3. Run the narrowest relevant checks first, then `make lint` and `make test`
   when the change scope warrants it.
4. Report checks that were not run and why.

## Repository Layout

```text
apps/mobile/    React Native iOS application (bundle prefix com.ajilus.oth)
docs/           Project, development, and release documentation
```
