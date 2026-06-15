# Deploy to a live URL

The deck is one self-contained HTML file — theme CSS is inline and the engine/fonts load from a CDN — so there are **no local assets to bundle**. Publishing is just putting that single file online as `index.html`. No build, no `deploy.sh`, no asset copying.

Offer this after the deck is built (see SKILL.md Step 5). Let the user pick the host — don't assume one. All three options below are free static hosts and run through `npx`, so nothing is installed globally.

## Prepare (same for every host)

Put the deck at the root of an otherwise empty folder, named `index.html`, so the bare URL serves it:

```bash
mkdir -p .deploy && cp <deck-slug>.html .deploy/index.html
```

Deploy the `.deploy` folder, then remove it when done.

## The login reality

All three need a one-time account login, and that step is **interactive** (a browser handshake or an email/password prompt) — you can't complete it for the user from a tool call. When a host reports "not logged in," hand the user the exact login command and ask them to run it themselves in this session with a leading `!` (e.g. `! npx vercel login`) so its output lands in the conversation. Once they're in, run the deploy.

## Option A — Surge

```bash
npx surge .deploy <deck-slug>.surge.sh
```

- First run prompts for an email + password and creates the account inline (no browser). If it stalls waiting on input, have the user run `! npx surge login` first.
- Pass an explicit `<something>.surge.sh` domain or it prompts for one. Pick a slug from the deck title; if it's taken, add a short suffix.
- Re-running with the same domain overwrites it — the URL stays put.

## Option B — Vercel

```bash
npx vercel deploy .deploy --yes --prod
```

- Check auth with `npx vercel whoami`. If not logged in, have the user run `! npx vercel login` (opens a browser), then re-run the deploy.
- Prints a production `https://…vercel.app` URL. Re-deploying the same project updates the same URL.
- Take it down later from the Vercel dashboard.

## Option C — Netlify

```bash
npx netlify deploy --dir=.deploy --prod
```

- Check auth with `npx netlify status`. If not logged in, have the user run `! npx netlify login` (opens a browser), then re-run.
- First deploy may ask to create/link a site — accept the create option. Prints a `https://…netlify.app` URL.

## After deploying

1. Open the live URL once to confirm it renders (right canvas, fonts loaded).
2. Give the user the URL and one line: it works on any device, share it anywhere.
3. Delete the temp folder: `rm -rf .deploy`.
4. Mention `?print-pdf` still works on the live URL for anyone who wants a PDF (`reference/export-pdf.md`).
