# Performance Review

Generated: 2026-05-01 17:37:54
Project: EasyLife
Repo: C:\Dev\easylifehq.github.io

## Verdict
GREEN

## Performance Read
Percy checked deterministic performance risks: oversized build artifacts, missing build artifacts when a build script exists, large inline base64 assets, transition-all CSS, blur/filter usage, very short polling intervals, broad will-change usage, and eager autoplay video.

## Summary
- Source files scanned: 246
- Build artifacts scanned: 0
- JavaScript bundle budget: 350KB
- CSS bundle budget: 180KB
- Static asset warning budget: 750KB
- RED issues: 0
- YELLOW issues: 0
- INFO signals: 20

## Largest Artifacts
- No build artifacts found.

## Findings
- [INFO] `app-vNext/src/styles/globals.css:210` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(16px);`
- [INFO] `app-vNext/src/styles/globals.css:301` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(18px);`
- [INFO] `app-vNext/src/styles/globals.css:329` - Blur filter found; keep usage limited on large/fixed surfaces.
  `-webkit-backdrop-filter: blur(22px) saturate(1.08);`
- [INFO] `app-vNext/src/styles/globals.css:330` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(22px) saturate(1.08);`
- [INFO] `app-vNext/src/styles/globals.css:1361` - Blur filter found; keep usage limited on large/fixed surfaces.
  `-webkit-backdrop-filter: blur(18px) saturate(1.08);`
- [INFO] `app-vNext/src/styles/globals.css:1362` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(18px) saturate(1.08);`
- [INFO] `app-vNext/src/styles/globals.css:5021` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(12px);`
- [INFO] `assets/index-HceE6n6y.css:1` - Blur filter found; keep usage limited on large/fixed surfaces.
  `:root{color-scheme:light;font-family:var(--shell-body-font, "Aptos", "Segoe UI", ui-sans-serif, system-ui, sans-serif);line-height:1.5;font-weight:400;color:#1f2528;background:#f3f...`
- [INFO] `old-site/css/global-nav.css:13` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(18px);`
- [INFO] `old-site/css/hub.css:159` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(14px);`
- [INFO] `old-site/css/index.css:173` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(12px);`
- [INFO] `old-site/easylist/css/global.css:247` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(16px);`
- [INFO] `old-site/easylist/css/protected.css:15` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(16px);`
- [INFO] `old-site/easylist/css/protected.css:294` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(8px);`
- [INFO] `old-site/easylist/css/protected.css:295` - Blur filter found; keep usage limited on large/fixed surfaces.
  `-webkit-backdrop-filter: blur(8px);`
- [INFO] `old-site/easynotes/css/dashboard.css:16` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(12px);`
- [INFO] `old-site/easynotes/css/index.css:92` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(12px);`
- [INFO] `old-site/easypipeline/css/index.css:122` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(18px);`
- [INFO] `old-site/easypipeline/css/protected.css:132` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(16px);`
- [INFO] `old-site/easypipeline/css/protected.css:431` - Blur filter found; keep usage limited on large/fixed surfaces.
  `backdrop-filter: blur(8px);`

## Stop Or Continue
continue
