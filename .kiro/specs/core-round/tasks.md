# Tasks: Core round

Branch: feature/core-round, from latest main. English commit messages.
Always explain and report in Japanese.

1. Create instructions/core.md with the exact text supplied in the
   implementation instruction file (IMPL-CORE.md will carry it verbatim).
2. Refactor instructions/player.md and instructions/board.md per
   design.md (reference the core; remove the duplicated codec steps and
   Python snippet; keep schema, field and content guidance, examples).
3. Update index.html anchors per design.md (raw Pages URLs for the
   sheets, "(for your AI chat)" in the labels, add the core anchor in
   the steps area). No CSS or layout changes.
4. Update README.md (core link near the top; no bare URLs).
5. Run `node --test` (expect 61/61, unchanged) and screenshot the landing
   at 1280px to confirm no visual change beyond link labels/targets.
6. Push the branch and open a PR titled "Core sheet (core.md), sheet
   refactor, and link presentation" with a summary of the changes.
Do not modify core/, apps/, theme.css, landing.css, or samples/.
