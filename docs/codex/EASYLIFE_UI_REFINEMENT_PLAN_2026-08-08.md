# EasyLife Wave 9 UI refinement plan

## Research signals

The product review focused on the calm utility patterns shared by Things, Linear, Todoist, Notion Calendar, Hevy, Strong, and Apple Fitness. The applicable lessons are deliberately product-agnostic:

- **Density is hierarchy, not smaller text.** Primary content gets room; supporting metadata uses a smaller type step and lighter contrast.
- **One action anchors a screen.** The important action stays obvious while alternate routes become quiet secondary controls or links.
- **Lists outperform nested cards for familiar records.** Use a shared surface for a section, then quiet dividers and compact rows inside it.
- **Statistics should scan as a row.** Show a value and label without turning every metric into a mini dashboard.
- **Mobile changes the composition.** Horizontal subnavigation scrolls, stats remain legible in compact columns, and all actionable controls keep a 44px minimum target.
- **Progressive disclosure protects the workout logger.** Prior-performance detail, methodology, and comparison evidence remain available but should stay secondary to the active set flow.

## EasyLife-specific decisions

1. Use one shared spacing scale and control heights across every module.
2. Lighten backgrounds, borders, shadows, and the global grid so application content leads the eye.
3. Reduce header, page, section, toolbar, and card padding while preserving readable body text and 44px mobile controls.
4. Use a smaller page max width and a consistently compact shell so dense lists do not become visually sparse on large screens.
5. Retain existing semantic headings, labels, focus treatment, reduced-motion behavior, demo isolation, workout persistence, and formulas.
6. Keep workout start/resume prominent, retain status and recovery receipts, and make statistical tables more compact without changing their content or calculations.

## Audit findings

- The top-level grid texture and repeated translucent panels competed with page content.
- Page headers, section cards, and gaps used more vertical area than their information needed.
- Navigation and search had mismatched visual weights across desktop and mobile.
- Metric cards and list rows were visually heavier than the information they presented.
- Some controls stayed full-height even when they were tertiary actions.

## Scope and non-goals

This wave is a shared visual refinement, not a feature rewrite. It does not change Firebase configuration, authorization, workout formulas, persistence, routes, or generated GitHub Pages output.
