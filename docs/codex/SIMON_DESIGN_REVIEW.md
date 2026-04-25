# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a calm, credible shell, but it is still presenting the suite like four polished brochures instead of one connected personal operating system.

## Mission Fit
The direction partially matches the mission: shared spacing, typography, teal accents, rounded surfaces, and consistent headers are helping the main areas feel related. The problem is that the inspected screens mostly show product-marketing hero pages, not the working life OS the mission describes. I can see polish, but I cannot yet see the user quickly understanding what needs attention, what is scheduled, what was completed, or how tasks, notes, calendar, and workouts connect. Confidence is lower for signed-in workflow quality because the screenshots are mostly public/product surfaces.

## Taste Check
The restrained palette, large confident type, soft grid background, and repeated page shell feel more premium than the earlier generic SaaS direction. The typography has presence, and the product copy is much sharper than filler dashboard mush.

But the layout is overcommitted to the same hero recipe everywhere: giant headline, CTA pair, pill tags, pale product card, feature cards. It is tasteful, yes, but also repetitive enough to feel templated. The mobile screenshots are especially heavy: everything becomes oversized, vertical, and slow to scan. The app is wearing a nice coat while still refusing to show me the actual job.

## Visual Problems To Fix
- The first viewport has too much dead vertical space between the nav and hero, especially on mobile, making the product feel slower than it is.
- Mobile hero headlines are too large and create bulky multi-line blocks that delay access to useful content.
- The pill tags are oversized on mobile and visually compete with the primary actions instead of acting as supporting metadata.
- The right-side "EasyLifeHQ product" card repeats brand context already present in the nav and does not prove connected-suite utility.
- Desktop pages use the same composition across products so strongly that EasyList, EasyNotes, EasyCalendar, and EasyWorkout blur together.
- Feature cards sit below the fold and feel secondary, while the mission-critical operational value is hidden beneath marketing copy.
- The pale teal treatment is pleasant but too dominant; the suite needs clearer app-level hierarchy without becoming a rainbow.
- The top nav feels like a landing page nav, not a personal operating system nav.

## Strongest Opportunities
- Replace the generic right hero card with a compact "Today across EasyLife" style preview that shows tasks, notes, calendar, and workout signals together.
- Tighten mobile first screens so a user sees the headline, one action, and a meaningful product preview without scrolling through a parade of giant pills.
- Give each app one restrained identity cue through layout content, iconography, or data shape, not louder color.
- Move from sales-page hierarchy toward operating-system hierarchy: status, next action, recent activity, and cross-app handoff.
- Make Settings feel like the suite control center visually, with denser grouped controls and clearer section priority.

## Priority Fix
Fix the first-viewport proof of mission. The next design pass should reduce the hero bulk and replace the decorative product card pattern with a compact operational preview that demonstrates connection across the suite. Nami should turn this into small tasks: tighten mobile hero spacing, shrink support pills, and make one right-side panel show real cross-app structure instead of another brand card.

## Designer Handoff
Keep the calm shell, the confident type, the soft surface treatment, and the professional restraint. Change the product pages from "nice pitch decks" into evidence of a connected daily system. The next implementer should make the first screen denser and more useful: one clear headline, one primary action, smaller supporting tags, and a preview panel that looks like EasyLife doing work. The user should feel, within five seconds, "this app will help me run my day," not "this startup hired a polite template."

## What Not To Do Next
- Do not add more landing sections to solve a first-viewport clarity problem.
- Do not add decorative gradients, blobs, illustrations, or visual confetti.
- Do not make every app louder with a different color scheme.
- Do not touch backend, auth, routing behavior, persistence, packages, or deployment.
- Do not ignore mobile; mobile is where the current layout feels most indulgent.
- Do not keep polishing cards below the fold while the first screen remains too brochure-like.

## Next 5 Design Tasks
- [ ] Mobile hero density pass: reduce vertical bulk on one product page at 390px by tightening headline scale, hero padding, and tag spacing without changing copy meaning or behavior.
- [ ] Product card utility pass: replace one decorative "EasyLifeHQ product" hero card with a compact operational preview using existing static UI content only; no new data, persistence, or routing.
- [ ] Pill hierarchy pass: make hero tags visually secondary to primary actions across one shared pattern; keep tap targets usable and avoid adding new colors.
- [ ] Desktop first-viewport rhythm pass: reduce the nav-to-hero dead space and ensure the next content band is hinted without compressing the layout into clutter.
- [ ] App identity restraint pass: give one app page a clearer functional identity through layout or content structure, not louder color, new sections, or backend scope.

## Stop Or Continue
continue but fix visual issues first