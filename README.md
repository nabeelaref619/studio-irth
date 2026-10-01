# Studio Irth website

Live domain: https://studioirth.com

Repository: https://github.com/nabeelaref619/studio-irth

Publishing: GitHub Pages, branch `main`, repository root.

## Managing changes from the website chat

Describe the section, the change, and any replacement links or images in the ongoing Studio Irth website chat. The established workflow is to edit the source below, preview English and Arabic, commit the requested changes to GitHub, and verify the Pages deployment. Use the current remote `main` as the starting point so other edits are preserved.

## Where to edit

| Content | Source |
| --- | --- |
| Projects, categories, stages, descriptions and project links | `portfolio.js` → `portfolio` |
| Founder bio, skills and media card text | `portfolio.js` → `profile.en` / `profile.ar` |
| TV and podcast destinations, including timestamp links | `portfolio.js` → `mediaLinks` (same order as the media cards) |
| General bilingual page copy and services | `content.js` → `copy.en` / `copy.ar` |
| Page structure, header, hero and footer | `src/index.template.html` |
| Layout, responsive spacing, colours and animation | `style.css` |
| Language switching, filters and interactions | `app.js` |
| Studio hero artwork | `irth-studio-hero.webp` |
| Original logo and fonts | `irth-logo.png`, `fonts.css`, `fonts/` |

`index.html` is generated. Make structural changes in the template and content changes in the data files, then rebuild; do not maintain duplicate project or media copy in `index.html` by hand.

Project text arrays are ordered `[English, Arabic]`. Keep IDs unique and stable. Categories are `digital` or `creative`; stages are `active`, `completed`, `exploration` or `archive`. Use only confirmed descriptions, dates, deliverables, results and public links. A collaboration with an unconfirmed completion date belongs under `archive`, without a claim that it is delivered.

## Build and verify

Requires Node.js. The publishing script uses built-in modules and requires no package installation.

```sh
node scripts/render-static.cjs
node scripts/render-static.cjs --check
node --check app.js
node --check content.js
node --check portfolio.js
git diff --check
```

The renderer uses the site's own rendering functions to generate the default English page, project counts and media links. It validates bilingual project fields and local assets, and adds content hashes to CSS/JS URLs automatically so browsers load each update. `--check` reports stale generated HTML without changing files.

Preview the generated page in a browser. Check the changed area in English and Arabic at phone, tablet and desktop widths; check relevant filters, project disclosures and replacement links. `?lang=ar` opens the Arabic view.

## Publish

1. Read the latest remote `main` and preserve changes made outside this chat.
2. Build and verify locally, then commit the relevant source files, generated `index.html` and any new assets together.
3. Update `main` without force-pushing. GitHub Pages deploys automatically from the root.
4. Check that the `pages build and deployment` run succeeds for that exact commit. Verify the changed live content when the domain is reachable; report any access or certificate issue separately from deployment status.

Include the source template, renderer and this guide in GitHub so the process survives a new workstation or chat session. Local preview dependencies and QA harnesses are development aids, not required by GitHub Pages. Never place credentials in this public repository.

To undo a release, revert its commit and publish the revert; preserve the history.

## Design and content rules

- English is the default; Arabic uses RTL. Use Poppins for English and Tajawal for Arabic.
- Preserve the burgundy/rose theme, the original logo and the centered studio artwork.
- Keep the services strip centered in both languages, without a discovery caption.
- Contact: `naref@studioirth.com`. Keep `CNAME` set to `studioirth.com` and retain the existing Pages setup.
- JTS is a portfolio entry only. The client's application and data are separate from this public website.
- The 4×4 Club entry currently contains only the confirmed collaboration name; expand its scope when Nabil supplies details.
