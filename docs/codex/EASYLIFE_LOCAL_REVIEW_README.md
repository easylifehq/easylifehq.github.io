# EasyLife Local Review README

Use this when you just need the local review server and the review URLs.

## Start The Server

Open PowerShell in `C:\Dev\easylifehq.github.io\app-vNext` and run:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 4231
```

Wait until Vite prints a local URL for port `4231`.

## Open These URLs

- Today: `http://127.0.0.1:4231/app/hq?demo=1`
- Inbox: `http://127.0.0.1:4231/app/easylist/add?demo=1`
- Plan: `http://127.0.0.1:4231/app/easycalendar/day?demo=1`
- Notes: `http://127.0.0.1:4231/app/easynotes?demo=1`
- Settings: `http://127.0.0.1:4231/app/settings?demo=1`

## Important Review Mode Note

Use `npm.cmd run dev`, not production preview, for this review. The `?demo=1` route access is intentionally dev-only. Production preview may redirect protected routes to login, which is expected and does not mean the review routes are broken.

## Stop The Server

In the PowerShell window running Vite, press:

```text
Ctrl+C
```

If the server was started in a hidden/background process, stop the listener on port `4231`:

```powershell
Get-NetTCPConnection -LocalPort 4231 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Review Companions

- Full review packet: `docs/codex/EASYLIFE_HUMAN_REVIEW_PACKET.md`
- Notes template: `docs/codex/EASYLIFE_HUMAN_REVIEW_NOTES.md`
