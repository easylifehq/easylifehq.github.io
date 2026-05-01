# Accessibility Review

Generated: 2026-05-01 15:13:57
Project: EasyLife
Repo: C:\Dev\easylifehq.github.io

## Verdict
RED

## Accessibility Read
Ada checked deterministic accessibility risks: missing image alt text, unlabeled inputs, empty/icon-only buttons, dead hash links, vague link text, and removed focus outlines.

## Summary
- Files scanned: 116
- RED issues: 15
- YELLOW issues: 67
- INFO signals: 2

## Findings
- [YELLOW] `app-vNext/src/features/auth/routes/LoginPage.tsx:130` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={isSubmitting}>`
- [YELLOW] `app-vNext/src/features/easycalendar/components/CalendarComposer.tsx:380` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={isSavingEvent}>`
- [YELLOW] `app-vNext/src/features/easycalendar/components/CalendarComposer.tsx:494` - Icon-style button may need an accessible label.
  `<button
          type="submit"
          className="primary-button"
          disabled={isSavingTaskBlock || !activeTasks.length}
        >`
- [YELLOW] `app-vNext/src/features/easycalendar/components/CalendarEventDrawer.tsx:285` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={isSaving}>`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx:401` - Icon-style button may need an accessible label.
  `<button
            type="button"
            className="ghost-button compact-button calendar-plan-preview-button"
            onClick={handlePlanMyDayPreview}
            disabled...`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx:516` - Icon-style button may need an accessible label.
  `<button
                          key={`${item.kind}-${item.id}-${slot.startAt.toISOString()}`}
                          type="button"
                          onClick={() => {`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx:566` - Icon-style button may need an accessible label.
  `<button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  className="calendar-detail-card deadline"
                  style={{ "--...`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx:636` - Icon-style button may need an accessible label.
  `<button
                    key={mode}
                    type="button"
                    className={quickEvent.mode === mode ? "active" : ""}
                    onClick={() =>`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx:735` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={isSavingQuickEvent}>`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarMonthPage.tsx:214` - Icon-style button may need an accessible label.
  `<button
                      key={`${item.kind}-${item.id}`}
                      type="button"
                      onClick={(event) => {`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarWeekPage.tsx:112` - Icon-style button may need an accessible label.
  `<button
                        key={`${item.kind}-${item.id}`}
                        type="button"
                        onClick={() => {`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarWeekPage.tsx:183` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button">`
- [RED] `app-vNext/src/features/easycalendar/routes/EasyCalendarWeekPage.tsx:196` - Input may be missing a programmatic label.
  `<input
                  type="color"
                  value={category.color}
                  onChange={(event) => {`
- [RED] `app-vNext/src/features/easycalendar/routes/EasyCalendarWeekPage.tsx:218` - Input may be missing a programmatic label.
  `<input
                    value={categoryDrafts[category.id] ?? category.name}
                    onChange={(event) =>`
- [YELLOW] `app-vNext/src/features/easycontacts/components/ContactDrawer.tsx:174` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button">`
- [YELLOW] `app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx:165` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button">`
- [RED] `app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx:246` - Input may be missing a programmatic label.
  `<input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" />`
- [YELLOW] `app-vNext/src/features/easylist/components/TaskComposer.tsx:564` - Icon-style button may need an accessible label.
  `<button
              type="button"
              className="button-secondary"
              onClick={handleBrainDumpToRows}
              disabled={isAnalyzing || !brainDump.trim(...`
- [YELLOW] `app-vNext/src/features/easylist/components/TaskComposer.tsx:704` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary" onClick={addBlankRow}>`
- [YELLOW] `app-vNext/src/features/easylist/components/TaskComposer.tsx:707` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={isSubmitting || readyCount === 0}>`
- [YELLOW] `app-vNext/src/features/easylist/components/TaskDrawer.tsx:470` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={isSaving}>`
- [YELLOW] `app-vNext/src/features/easylist/components/TaskDrawer.tsx:577` - Icon-style button may need an accessible label.
  `<button
                type="button"
                className="primary-button"
                onClick={() =>`
- [RED] `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx:262` - Input may be missing a programmatic label.
  `<input
                type="search"
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}`
- [YELLOW] `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx:279` - Icon-style button may need an accessible label.
  `<button
                      key={name}
                      type="button"
                      className={activeListName === name ? "active" : ""}
                      onClick...`
- [RED] `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx:296` - Input may be missing a programmatic label.
  `<input
                      value={newListName}
                      onChange={(event) => setNewListName(event.target.value)}`
- [YELLOW] `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx:301` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary compact-button" onClick={addList}>`
- [YELLOW] `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx:312` - Icon-style button may need an accessible label.
  `<button
                  type="button"
                  className={isBulkEditing ? "primary-button compact-button" : "button-secondary compact-button"}
                  onClick=...`
- [YELLOW] `app-vNext/src/features/easynotes/routes/EasyNotesEditorPage.tsx:219` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary compact-button" onClick={handleProcessNote}>`
- [YELLOW] `app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx:167` - Icon-style button may need an accessible label.
  `<button
              type="button"
              className="notes-command-button"
              onClick={() => {`
- [YELLOW] `app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx:338` - Icon-style button may need an accessible label.
  `<button
                type="button"
                className="ghost-button compact-button"
                onClick={handleSelectVisible}
                disabled={!filteredNotes...`
- [YELLOW] `app-vNext/src/features/easypipeline/components/ApplicationDrawer.tsx:224` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={isSaving}>`
- [YELLOW] `app-vNext/src/features/easypipeline/routes/EasyPipelineDashboardPage.tsx:127` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={!company.trim() || !title.trim()}>`
- [YELLOW] `app-vNext/src/features/easypipeline/routes/EasyPipelineEmailPage.tsx:135` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button">`
- [YELLOW] `app-vNext/src/features/easyprojects/routes/EasyProjectDetailPage.tsx:176` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary" onClick={startEditingProject}>`
- [RED] `app-vNext/src/features/easyprojects/routes/EasyProjectDetailPage.tsx:195` - Input may be missing a programmatic label.
  `<input name="title" className="search-input" placeholder="Research, Build, Polish..." />`
- [RED] `app-vNext/src/features/easyprojects/routes/EasyProjectDetailPage.tsx:226` - Input may be missing a programmatic label.
  `<input value={editingSectionTitle} onChange={(event) => setEditingSectionTitle(event.target.value)} className="search-input" />`
- [YELLOW] `app-vNext/src/features/easyprojects/routes/EasyProjectsHomePage.tsx:219` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={!newProjectTitle.trim()}>`
- [YELLOW] `app-vNext/src/features/easyprojects/routes/EasyProjectsHomePage.tsx:299` - Icon-style button may need an accessible label.
  `<button
                    type="submit"
                    className="primary-button"
                    disabled={isPlanning || (!plannerTitle.trim() && !plannerDescription.tr...`
- [YELLOW] `app-vNext/src/features/easyworkout/routes/EasyWorkoutLogPage.tsx:338` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary" onClick={parseWorkoutPaste} disabled={!workoutPaste.trim()}>`
- [YELLOW] `app-vNext/src/features/easyworkout/routes/EasyWorkoutLogPage.tsx:393` - Icon-style button may need an accessible label.
  `<button type="button" className="ghost-button compact-button" onClick={removeBlankExerciseBoxes}>`
- [YELLOW] `app-vNext/src/features/easyworkout/routes/EasyWorkoutLogPage.tsx:490` - Icon-style button may need an accessible label.
  `<button
                      type="button"
                      className="button-secondary"
                      onClick={() => {`
- [YELLOW] `app-vNext/src/features/experiments/AiCommandCenter.tsx:231` - Icon-style button may need an accessible label.
  `<button
              key={mock.prompt}
              type="button"
              onClick={() => {`
- [YELLOW] `app-vNext/src/features/experiments/UniversalCapture.tsx:756` - Icon-style button may need an accessible label.
  `<button
              key={value}
              type="button"
              className={`capture-mode-button${mode === value ? " active" : ""}`}
              onClick={() => {`
- [RED] `app-vNext/src/features/experiments/UniversalCapture.tsx:794` - Input may be missing a programmatic label.
  `<input
                value={details.taskCategory}
                onChange={(event) => setDetails((current) => ({ ...current, taskCategory: event.target.value }))}`
- [YELLOW] `app-vNext/src/features/settings/routes/SettingsPage.tsx:1394` - Icon-style button may need an accessible label.
  `<button type="button" className="primary-button" onClick={handleExportAll}>`
- [YELLOW] `app-vNext/src/features/settings/routes/SettingsPage.tsx:1397` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary" onClick={handleCopySummary}>`
- [YELLOW] `app-vNext/src/features/settings/routes/SettingsPage.tsx:1489` - Icon-style button may need an accessible label.
  `<button type="button" className="primary-button" onClick={handleOpenInstallShare}>`
- [YELLOW] `app-vNext/src/features/settings/routes/SettingsPage.tsx:1626` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary" onClick={handleSendTestNotification}>`
- [RED] `app-vNext/src/styles/globals.css:1663` - Focus outline is removed without an obvious focus-visible replacement.
  `outline: none;`
- [RED] `app-vNext/src/styles/globals.css:2617` - Focus outline is removed without an obvious focus-visible replacement.
  `outline: none;`
- [INFO] `app-vNext/src/styles/globals.css:9716` - Reduced-motion handling is present.
  `@media (prefers-reduced-motion: reduce) {`
- [INFO] `assets/index-HceE6n6y.css:1` - Reduced-motion handling is present.
  `:root{color-scheme:light;font-family:var(--shell-body-font, "Aptos", "Segoe UI", ui-sans-serif, system-ui, sans-serif);line-height:1.5;font-weight:400;color:#1f2528;background:#f3f...`
- [RED] `old-site/css/auth.css:187` - Focus outline is removed without an obvious focus-visible replacement.
  `outline: none;`
- [YELLOW] `old-site/easylist/add-tasks.html:17` - Icon-style button may need an accessible label.
  `<button
            type="button"
            class="brand-menu-trigger"
            id="brandMenuBtn"
            aria-expanded="false"
            aria-controls="brandDropdownMen...`
- [YELLOW] `old-site/easylist/add-tasks.html:59` - Icon-style button may need an accessible label.
  `<button type="button" class="ghost-btn compact-logout-btn" id="logoutBtn">`
- [YELLOW] `old-site/easylist/add-tasks.html:79` - Icon-style button may need an accessible label.
  `<button type="button" class="ghost-btn" id="addTaskRowBtn">`
- [YELLOW] `old-site/easylist/add-tasks.html:82` - Icon-style button may need an accessible label.
  `<button type="submit" class="primary-btn" id="saveTasksBtn">`
- [YELLOW] `old-site/easylist/archive.html:19` - Icon-style button may need an accessible label.
  `<button
            type="button"
            class="brand-menu-trigger"
            id="brandMenuBtn"
            aria-expanded="false"
            aria-controls="brandDropdownMen...`
- [YELLOW] `old-site/easylist/archive.html:61` - Icon-style button may need an accessible label.
  `<button type="button" class="ghost-btn compact-logout-btn" id="logoutBtn">`
- [RED] `old-site/easylist/css/global.css:178` - Focus outline is removed without an obvious focus-visible replacement.
  `outline: none;`
- [YELLOW] `old-site/easylist/dashboard.html:17` - Icon-style button may need an accessible label.
  `<button
            type="button"
            class="brand-menu-trigger"
            id="brandMenuBtn"
            aria-expanded="false"
            aria-controls="brandDropdownMen...`
- [YELLOW] `old-site/easylist/dashboard.html:59` - Icon-style button may need an accessible label.
  `<button type="button" class="ghost-btn compact-logout-btn" id="logoutBtn">`
- [YELLOW] `old-site/easylist/dashboard.html:79` - Icon-style button may need an accessible label.
  `<button
                type="button"
                class="view-btn active"
                data-view-mode="week"
                aria-pressed="true"
              >`
- [YELLOW] `old-site/easylist/dashboard.html:87` - Icon-style button may need an accessible label.
  `<button
                type="button"
                class="view-btn"
                data-view-mode="twoWeeks"
                aria-pressed="false"
              >`
- [YELLOW] `old-site/easylist/dashboard.html:95` - Icon-style button may need an accessible label.
  `<button
                type="button"
                class="view-btn"
                data-view-mode="month"
                aria-pressed="false"
              >`
- [YELLOW] `old-site/easylist/dashboard.html:105` - Icon-style button may need an accessible label.
  `<button type="button" class="ghost-btn planner-refresh-btn" id="refreshPlannerBtn">`
- [RED] `old-site/easynotes/css/dashboard.css:283` - Focus outline is removed without an obvious focus-visible replacement.
  `outline: none;`
- [RED] `old-site/easynotes/css/global.css:62` - Focus outline is removed without an obvious focus-visible replacement.
  `outline: none;`
- [YELLOW] `old-site/easynotes/dashboard.html:15` - Icon-style button may need an accessible label.
  `<button
            type="button"
            class="brand-menu-trigger"
            id="brandMenuBtn"
            aria-expanded="false"
            aria-controls="brandDropdownMen...`
- [YELLOW] `old-site/easypipeline/contacts.html:229` - Icon-style button may need an accessible label.
  `<button type="button" class="btn btn-danger hidden" id="archiveContactBtn">`
- [RED] `old-site/easypipeline/css/protected.css:87` - Focus outline is removed without an obvious focus-visible replacement.
  `outline: none;`
- [YELLOW] `old-site/easypipeline/dashboard.html:111` - Icon-style button may need an accessible label.
  `<button class="archived-header" id="archivedToggle" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:43` - Icon-style button may need an accessible label.
  `<button id="refreshApplicationsBtn" class="secondary-btn" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:157` - Icon-style button may need an accessible label.
  `<button id="generateDraftBtn" class="primary-btn" type="submit">`
- [YELLOW] `old-site/easypipeline/email-generator.html:160` - Icon-style button may need an accessible label.
  `<button id="clearFormBtn" class="ghost-btn" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:206` - Icon-style button may need an accessible label.
  `<button id="copySubjectBtn" class="secondary-btn" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:209` - Icon-style button may need an accessible label.
  `<button id="copyBodyBtn" class="secondary-btn" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:212` - Icon-style button may need an accessible label.
  `<button id="saveDraftBtn" class="primary-btn" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:218` - Icon-style button may need an accessible label.
  `<button id="shorterBtn" class="ghost-btn" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:221` - Icon-style button may need an accessible label.
  `<button id="warmerBtn" class="ghost-btn" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:224` - Icon-style button may need an accessible label.
  `<button id="strongerBtn" class="ghost-btn" type="button">`
- [YELLOW] `old-site/easypipeline/email-generator.html:227` - Icon-style button may need an accessible label.
  `<button id="regenerateBtn" class="ghost-btn" type="button">`
- [YELLOW] `old-site/index.html:264` - Hash-only link may behave like a button or dead link.
  `<a href="#" class="tool-link disabled-link">More soon</a>`
- [YELLOW] `old-site/login.html:49` - Icon-style button may need an accessible label.
  `<button id="forgotPasswordBtn" class="text-btn" type="button">`

## Stop Or Continue
stop for human accessibility review
