# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one calm product family, but the marketing pages still wear too much padding and repetition like a nervous blazer.

## Mission Fit
The current direction matches the mission better than earlier batches: the shared navigation, consistent product hero pattern, restrained palette, and cross-app operational preview all support the idea of EasyLife as a connected personal operating system. The issue is that the suite now feels coherent at the surface level, but not yet especially useful or premium in the first viewport. The design says "organized," but it does not yet say "indispensable."

## Taste Check
The strongest move is the quiet professional palette, the softened grid background, and the operational preview replacing decorative product-card fluff. The typography has confidence, and the repeated EasyLifeHQ identity is clear.

What is off: the pages are too templated across products, the mobile hero still eats a lot of vertical space, and the pills are visually heavier than their informational value deserves. The right-side preview is useful in concept, but the same row pattern appears everywhere, so it starts to feel like placeholder SaaS dressing instead of a real personal operating system. Less museum label, more daily command surface.

## Visual Problems To Fix
- Mobile has a large blank gap between the brand nav and the hero card, which delays meaningful content before the user sees the actual product promise.
- Mobile navigation collapses to branding only, removing visible product movement or action cues from the first viewport.
- Hero cards are still too tall on 390px screens; the preview module starts below the primary copy and pushes feature content far down the page.
- Support pills remain too loud and bulky relative to the main CTA and body copy, especially on mobile where they become a second headline cluster.
- The cross-app preview rows are identical across product pages, which weakens each product's specific identity.
- Desktop pages look orderly but slightly over-contained: nav card, hero card, preview card, feature card. The rhythm is clean, but very boxed.
- The grid background is elegant at desktop scale but can feel like visual scaffolding on mobile because it shows through large empty vertical zones.
- Product heroes share the same composition so closely that EasyList, EasyNotes, EasyCalendar, and EasyWorkout risk feeling like copy swaps rather than distinct parts of one suite.

## Strongest Opportunities
- Make each hero preview show one product-specific daily moment instead of the same generic EasyHQ row stack everywhere.
- Tighten mobile first viewport rhythm so headline, CTA, and at least the top of the operational preview all appear sooner.
- Turn support pills into quieter metadata, not visual buttons pretending to be useful.
- Add subtle product-specific accent behavior within the shared system so the suite feels unified without being cloned.
- Make feature cards less generic by using sharper labels, denser scan patterns, and stronger contrast between headline, body, and category text.
- Reduce stacked-card feeling on desktop by letting some sections breathe as full-width bands instead of every area reading as a white container.

## Priority Fix
Fix the mobile first viewport hierarchy. The next implementer should reduce the vertical dead space above the hero, compact the hero padding, quiet the support pills, and bring the operational preview higher without adding new sections. At 390px, the user should see brand, product promise, primary action, and a hint of real product utility before the page becomes a scroll tax.

## Designer Handoff
Keep the calm palette, the shared product shell, the confident type scale, and the connected-suite language. Change the density and specificity: mobile should feel faster, desktop should feel less boxed, and each product preview should show a distinct use case from that product while still referencing the suite. Treat the UI like a premium personal operating system, not a brochure template. The user should feel, within one screen, "this will help me run my day," not "this is another pleasant productivity landing page."

## What Not To Do Next
- Do not add more marketing sections to compensate for weak first-screen hierarchy.
- Do not make the palette louder or add decorative gradients to create "personality."
- Do not add more pills, badges, or micro-labels.
- Do not redesign the whole product shell.
- Do not touch backend, auth, routing behavior, persistence, package files, or deployment scope.
- Do not ignore mobile because the desktop screenshots look presentable.
- Do not make every product page share the exact same preview content.

## Next 5 Design Tasks
- [ ] Mobile hero density pass: reduce top spacing and hero padding on one product page at 390px so the operational preview begins sooner; preserve copy meaning and existing behavior.
- [ ] Support pill hierarchy pass: make product hero support tags visually secondary to CTAs and body copy; keep tap targets usable and avoid adding colors.
- [ ] Product preview specificity pass: update one hero preview so it reflects that product's actual daily use case instead of reusing the generic suite row stack; static UI only.
- [ ] Desktop boxed-layout relief pass: adjust one marketing section so the page rhythm feels less like stacked cards while preserving the shared shell and current content.
- [ ] Mobile nav utility pass: add or expose one safe existing action cue in the mobile header area without changing routing behavior or adding new navigation complexity.

## Stop Or Continue
continue but fix visual issues first