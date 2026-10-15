# Deploy to a live URL

The deck is a single self-contained file, so publishing is just putting it online as `index.html`: no build, no asset copying.

All three options below are free static hosts and run through `npx`, so nothing is installed globally.

## Prepare (same for every host)

Put the deck at the root of an otherwise empty folder, named `index.html`, so the bare URL serves it:

```bash
mkdir -p .deploy && cp <deck-slug>.html .deploy/index.html
```

Deploy the `.deploy` folder, then remove it when done.

## The login reality

All three need a one-time account login, and that step is **interactive** — surge asks for email + password, Vercel/Netlify open a browser. You can't drive it from a tool call, and it can **not** go through the agent prompt's `!` shell either: `!` runs a command but can't feed an interactive multi-prompt stdin, so `npx surge login` just hangs at `email:` with nowhere to type.

So the login has to happen in the user's **own terminal window** (the real Terminal/iTerm app, not this session). Tell the user to run the login command there, complete it, and report back. The credential is saved to disk (`~/.netrc` for surge, the CLI's own config for Vercel/Netlify), and from then on the deploy command reads it — so once the user is logged in, **you** run the deploy non-interactively.

Alternative for a fully agent-driven deploy: a token. If the user pastes one, deploy with it and skip the terminal step entirely — surge takes the `SURGE_TOKEN` env var (the user creates one with `npx surge token` in their own terminal), Vercel takes `--token`, Netlify takes `--auth`.

## Option A — Surge

```bash
npx surge .deploy <deck-slug>.surge.sh
```

- Auth is email + password (no browser); the user runs `npx surge login` once in their own terminal (see above).
- Pass an explicit `<something>.surge.sh` domain or it prompts for one. Pick a slug from the deck title; if it's taken, add a short suffix.
- Re-running with the same domain overwrites it — the URL stays put.

## Option B — Vercel

```bash
npx vercel deploy .deploy --yes --prod
```

- Check auth with `npx vercel whoami`. If not logged in, have the user run `npx vercel login` in their own terminal (opens a browser), then re-run the deploy.
- Prints a production `https://…vercel.app` URL. Re-deploying the same project updates the same URL.
- Take it down later from the Vercel dashboard.

## Option C — Netlify

```bash
npx netlify deploy --dir=.deploy --prod
```

- Check auth with `npx netlify status`. If not logged in, have the user run `npx netlify login` in their own terminal (opens a browser), then re-run.
- With no linked site, the first deploy asks to create or link one, and that prompt cannot be answered from a tool call. Either have the user run `npx netlify link` in their own terminal first, or create the site in the deploy with `--site-name <name>` (it implies `--create-site`; `--site <name-or-id>` targets an existing one). Prints a `https://…netlify.app` URL.

## After deploying

1. Open the live URL once to confirm it renders (right canvas, fonts loaded). For Vercel, also open it logged out or in a private window. If it asks for a Vercel login, tell the user to set Deployment Protection to none in the project settings, or the link will not work for anyone else.
2. Give the user the URL and one line: it works on any device, share it anywhere.
3. Delete the temp folder: `rm -rf .deploy`. Keep the `.vercel` or `.netlify` link folder so a later redeploy reuses the same site and URL; remove it only for a throwaway deploy. Surge leaves nothing behind.
