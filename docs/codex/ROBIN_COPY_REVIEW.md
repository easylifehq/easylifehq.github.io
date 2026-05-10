# Robin Copy Review

## Verdict
NOT_READY_FOR_VISUAL_PASS

## One-Sentence Read
The signed-in core now mostly speaks like one assistant, but the public/login shell still introduces EasyLife like a product inventory.

## What Improved
- Login proof copy no longer frames the product as a tool shelf.
- App header assistive copy now says assistant navigation and keeps the visible model at Today, Inbox, Plan, Notes, More.
- Inbox now reads as one intake surface with approve, Plan, and Today language.
- Plan now uses fixed items, focus blocks, due items, Today timeline, and quick add plan item instead of calendar-app labels.
- Notes now reads as Memory with context groups, task cues, plan cues, pinned context, and old-context review.

## Copy That Still Hurts The Product
- The `/login` route still renders surrounding public navigation with "Explore products," "Products," and product names such as EasyHQ, EasyList, and EasyNotes. Those strings live outside the owned files for this slice.
- Marketing route metadata and public product navigation still carry the old suite structure.
- Some deeper non-owned surfaces still use EasyList/EasyNotes language, especially archive/deleted/editor and optional More modules.

## Does The App Read As One Assistant?
Yes inside the signed-in review path for Today, Inbox, Plan, Notes, and Settings/More. Not yet from the public/login entrance.

## Route Inspection
- Method: local Vite preview on `http://127.0.0.1:4186`, rendered DOM captured with headless Chrome `--dump-dom`.
- Checked: `/login`, `/app/hq?demo=1`, `/app/easylist/add?demo=1`, `/app/easycalendar/day?demo=1`, `/app/easynotes?demo=1`, `/app/settings?demo=1`.
- Build: `npm.cmd run build` passed from `app-vNext`.

## Next Copy Tasks
- [ ] Clean `MarketingHeader`, `marketingNavigation`, and the public landing/product routes so login no longer starts with feature inventory.
- [ ] Clean non-owned deeper route chrome for EasyList/EasyNotes archive, deleted, editor, and optional More paths.
- [ ] Keep AI language modest until real assistant behavior exists.

## Stop Or Continue
continue with public/login shell copy cleanup before broad visual polish
