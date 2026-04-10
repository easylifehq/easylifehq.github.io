# Easy System

This repository now has two important layers:

- the live deployable site at the repo root
- the React source app in [app-vNext](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\app-vNext)

## What Deploys

The repo root is now the deploy target.

- [index.html](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\index.html) and [assets](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\assets) are the built React output
- [404.html](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\404.html) is included for SPA route fallback
- [CNAME](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\CNAME) is preserved for the custom domain

## Source App

The editable React + Firebase app lives in:

- [app-vNext](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\app-vNext)

That app now contains:

- marketing pages
- auth
- EasyHQ
- EasyList
- EasyCalendar
- EasyNotes
- EasyPipeline
- EasyContacts

To work on it locally:

```bash
cd app-vNext
npm run dev
```

To rebuild the deployable root files:

```bash
cd app-vNext
npm run build
```

Then copy the fresh build output from [app-vNext/dist](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\app-vNext\dist) into the repo root.

## Archived Static Site

The old HTML/CSS/JS site has been preserved in:

- [old-site](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\old-site)

That folder is your backup in case you ever need to reference or recover the previous version.

## Notes

- The React app is now the main website version.
- The old static version still exists only as an archive.
- The current React production build succeeds locally.

See [docs/easy-system-engineering-handoff.md](C:\Users\smcol\Documents\Spencer%20Colety\easylife\easylifehq.github.io\docs\easy-system-engineering-handoff.md) for the architecture and migration handoff.
