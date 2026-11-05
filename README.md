# engineering-portfolio

Personal engineering portfolio of Mahesh Utlapalli, covering UI engineering, backend development and full-stack delivery. Built with Next.js 16 (Cache Components), React 19, TypeScript and Tailwind CSS 4, deployed on Vercel.

The site is a small production system rather than a brochure: typed content with a published-schema allowlist, a documented JSON API, a contact form with real abuse protection, and accessibility and performance budgets enforced in CI.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # optional: every variable has a safe fallback
pnpm dev
```

| Script                                                                              | What it does                                                                                |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start`                                            | Next.js development server, production build, production server                             |
| `pnpm lint` / `pnpm lint:fix` / `pnpm format`                                       | Biome lint and format                                                                       |
| `pnpm typecheck`                                                                    | TypeScript (`next typegen` runs on build; run `pnpm exec next typegen` after adding routes) |
| `pnpm test`                                                                         | Vitest unit tests                                                                           |
| `pnpm e2e`                                                                          | Playwright end-to-end and axe accessibility tests against a production build                |
| `pnpm lhci`                                                                         | Lighthouse CI with the budgets in `lighthouserc.json`                                       |
| `pnpm check:public`                                                                 | Starts the built site and fails if public output leaks anything outside the allowlist       |
| `node scripts/screenshots.mjs --base-url=http://localhost:3000 --out=./screenshots` | Full-page screenshot sweep across widths and themes                                         |

Requires Node 22 (`.nvmrc`) and pnpm 10.

## Architecture

- **Rendering.** App Router with Cache Components and Partial Prefetching. Pages prerender into a static shell; case studies and posts declare `ensureStatic = "navigation"` so the build fails if they ever read request data. View counts are fetched on the client from the API so pages stay cacheable.
- **Content.** `content/` holds case studies (`projects/*.mdx`), posts (`posts/*.mdx`), the single timeline data file (`experience.ts`), the skills matrix (`skills.ts`) and the site copy (`site.ts`). Zod schemas in `src/lib/schemas.ts` validate everything at build time; a figure cannot exist without a `basis`. Publication rules live in `content/README.md`.
- **Content gates.** Current-employer detail and the security-review sentence carry `gate` fields and render only when the matching flag in `content/site.ts` is true. Flip a flag only with confirmed approval; the home page, about page and résumé all follow it.
- **API.** `/api/v1/projects` and `/api/v1/projects/{slug}` serve the allowlisted shape with `ETag`, `Cache-Control` and CORS, and answer `If-None-Match` with 304. `/api/v1/openapi.json` is generated from the same Zod schemas and rendered at `/api/docs`. `/api/v1/views/{slug}` counts views in Redis, `/api/v1/github` serves cached GitHub activity, and `/api/health` reports status, version and dependency checks for an uptime monitor.
- **Contact.** A server action validates with Zod, drops honeypot submissions silently, verifies Cloudflare Turnstile when configured, rate limits per client (Upstash Redis, in-memory fallback) and delivers through Resend, logging to the console when no key is set.
- **Security headers.** Set in `next.config.ts`: CSP without nonces (nonces would force dynamic rendering), HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
- **Quality gates.** Biome, TypeScript, Vitest, the leak check, Playwright with axe on every route (desktop and mobile), Lighthouse CI budgets (scores of 95 or better on the mobile preset, LCP under 2.0 s, CLS under 0.05, TBT under 200 ms, script transfer at most 270 kB per page including the framework runtime and route prefetches), CodeQL and Dependabot.

## Environment variables

All optional. See `.env.example` for the full list.

| Variable                                                   | Feature                                             | Without it                                   |
| ---------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                     | Canonical URL for metadata, sitemap, feed, API docs | Defaults to `http://localhost:3000`          |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact form delivery                               | Submissions are logged to the server console |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`       | Rate limiting and view counts                       | In-memory limiter; view counts disabled      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`   | Bot check on the contact form                       | Check skipped                                |
| `GITHUB_TOKEN`                                             | Higher GitHub API rate limit                        | Unauthenticated requests                     |

Set these in Vercel (Project → Settings → Environment Variables), never in the repository.

## Adding content

- **Case study:** add `content/projects/<slug>.mdx` with frontmatter matching `projectFrontmatterSchema`. Sections: Context, Constraints, What I built, What changed, Stack. Use `<Inferred>` for a pre-state inferred from an outcome and `<Callout>` for what the page does not claim. `draft: true` hides it from production builds.
- **Post:** add `content/posts/<slug>.mdx`; the Writing link appears once two posts are published.
- **Timeline or skills:** edit `content/experience.ts` or `content/skills.ts`; both are validated on import.
- Run `pnpm build` and `pnpm check:public` before committing content.

## Deploying

1. Import the repository in Vercel; the framework preset is detected automatically.
2. Add the environment variables above. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
3. Every pull request gets a preview deployment; `main` deploys to production.
4. Point an uptime monitor at `/api/health`.

### Launch checklist

- [ ] Answers to the open content questions applied (`content/site.ts` flags stay `false` until approval is confirmed).
- [ ] Every employer-related claim diffed against the live LinkedIn profile.
- [ ] Public repositories reviewed for employer material before the GitHub profile is promoted.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm check:public && pnpm e2e && pnpm lhci` green.
- [ ] Domain, HTTPS and the uptime monitor configured.

## Licence

The source code is released under the MIT License (see `LICENSE`).

The site content is **not** covered by that licence. Case studies, writing, the résumé, images and all other material under `content/` and `public/` are copyright Mahesh Utlapalli, all rights reserved, and may not be reproduced without permission.
