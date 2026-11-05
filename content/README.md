# Content

Everything under `content/` is site content, copyright Mahesh Utlapalli, all rights reserved
(the MIT licence in the repository root covers code only).

## Publication rules

These rules come from the review of the owner's résumé and LinkedIn export. Follow them for every edit.

1. **Never publish:** a phone number; client, product or jurisdiction names; work authorization or nationality;
   the vulnerability classes from any security audit; internals of New York State tax systems; employer logos;
   the uploaded résumé PDF.
2. **Opt-in only** (off until the owner says otherwise): email in page copy, GPAs, spoken languages,
   town-level location, employer website links, photo, education start years.
3. **Gates.** Items with `gate: "omega"` or `gate: "security"` render only when the matching flag in
   `site.ts` is true, and the flags flip only with the owner's confirmation that Omega Permits approved the
   exact wording. `gate: "albany"` covers the LinkedIn-only bullets of the earlier Cloud Data Systems role.
4. **Qualifiers stay verbatim:** "estimated 60%", "around 35%", "roughly 40%", "up to 25%", "over 30%".
   Each pillar card on the home page carries at most two figures.
5. **Joint attribution preserved:** the 45% UI responsiveness and 30% backend latency results came from
   front-end optimization and backend restructuring together.
6. **Stronger LinkedIn verbs are not promoted to fact** where the résumé says "Developed". Prior states
   inferred from an outcome are labelled as inferred in case studies.
7. **Live LinkedIn is the ceiling:** before launch, diff every employer claim against linkedin.com/in/umahesh.
8. **Published schema allowlist:** `src/lib/schemas.ts` defines `publicProjectSchema`; the API serves only
   those keys and `pnpm check:public` fails the build on anything else, on contact data, or on audit details.
9. **Illustrations:** abstract diagrams with no real names, hostnames or bucket names; any reconstructed screen
   is captioned as an illustrative reconstruction with synthetic data.

## Adding a case study

Create `content/projects/<slug>.mdx` with the frontmatter validated by `projectFrontmatterSchema`
(`src/lib/schemas.ts`). Every figure in `outcomes` needs a `basis`: `{ kind: "measured", what, tool, window }`
or `{ kind: "stated", source }`. The body follows the template: Context, Constraints, What I built, What changed,
What I would do differently (optional), Stack. Set `draft: true` to keep it out of production builds.

## Adding a post

Create `content/posts/<slug>.mdx` validated by `postFrontmatterSchema`. The Writing link in the navigation
appears once two posts are published. Never write about the security audit's findings, even generically.
