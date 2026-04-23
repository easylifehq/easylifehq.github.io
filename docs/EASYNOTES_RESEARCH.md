# EasyNotes Research Notes (4.32.0)

This research pass is the planning baseline for the EasyNotes implementation release.

## Sources Reviewed

- Apple Notes support: folders, tags, smart folders, pinned notes.
- Notion help: sidebar navigation, favorites, library, search, and keeping the sidebar clean.
- Obsidian help: quick switcher and recent-note-first note retrieval.

## What Strong Note Tools Do Well

1. Open writing fast.
   - Apple Notes is strong because it gets you into a note quickly.
   - Obsidian's quick switcher is strong because opening a note is nearly instant from search.

2. Keep recent work close.
   - Obsidian surfaces recent notes in the quick switcher.
   - Apple Notes and Notion both make recent/favorite work easy to reopen.
   - The lesson: recent work should stay closer than heavy browse controls.

3. Make organization visible but not overwhelming.
   - Apple Notes uses folders, tags, smart folders, and pinning.
   - Notion uses favorites, recents, search, and library management to keep the sidebar clean.
   - The best systems let users organize without making the first screen feel like a file manager.

4. Search is part of the primary workflow.
   - Obsidian treats opening by search as a first-class action.
   - Notion treats search and library filtering as central, not hidden.

5. Favorites and pins matter.
   - Pinned and favorited notes give users an easy "keep this close" layer that does not depend on folder structure.

6. Bulk organization exists, but it should not dominate the main experience.
   - Notion's library supports batch moves and delete actions.
   - Those actions are useful, but not the first thing the user should feel.

## Best-Fit Directions For EasyNotes

### Keep

- Writing-first editor.
- Fast blank note creation.
- Recent-note continuity.
- Folder support.
- Search and edit modes separated from writing.

### Improve In 4.33.0

- Make the library surface feel even more like:
  - recent work first
  - pinned/favorite notes next
  - folders and broader organization available, but calmer
- Strengthen search as a first-class "open a note fast" tool.
- Make pinned notes and favorites more meaningful in the library.
- Tighten batch edit mode so it is useful but visually quiet.
- Keep the editor feeling like the main product, not the library.

### Avoid

- Letting the notes control page become a file explorer first and writing app second.
- Showing too many organization controls all at once.
- Making users choose folders/tags/settings before they can write.

## Implementation Plan For 4.33.0

1. Rebuild the notes library around recent notes, pinned notes, and calmer organization.
2. Make search/open-note flow faster and more central.
3. Keep folder and batch controls available, but behind quieter edit/organize surfaces.
4. Preserve fast blank-note and resume-writing behavior.
5. Keep the editor as the emotional center of EasyNotes.
