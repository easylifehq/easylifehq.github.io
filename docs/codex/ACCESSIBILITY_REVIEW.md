# Accessibility Review

Generated: 2026-05-05 17:19:48
Project: EasyLife
Repo: C:\Dev\easylifehq.github.io

## Verdict
YELLOW

## Accessibility Read
Ada checked deterministic accessibility risks: missing image alt text, unlabeled inputs, empty/icon-only buttons, dead hash links, vague link text, and removed focus outlines.

## Summary
- Files scanned: 85
- RED issues: 0
- YELLOW issues: 46
- INFO signals: 1

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
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarWeekPage.tsx:109` - Icon-style button may need an accessible label.
  `<button
                        key={`${item.kind}-${item.id}`}
                        type="button"
                        onClick={() => {`
- [YELLOW] `app-vNext/src/features/easycalendar/routes/EasyCalendarWeekPage.tsx:180` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button">`
- [YELLOW] `app-vNext/src/features/easycontacts/components/ContactDrawer.tsx:174` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button">`
- [YELLOW] `app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx:164` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button">`
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
- [YELLOW] `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx:279` - Icon-style button may need an accessible label.
  `<button
                      key={name}
                      type="button"
                      className={activeListName === name ? "active" : ""}
                      onClick...`
- [YELLOW] `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx:302` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary compact-button" onClick={addList}>`
- [YELLOW] `app-vNext/src/features/easylist/routes/EasyListDashboardPage.tsx:313` - Icon-style button may need an accessible label.
  `<button
                  type="button"
                  className={isBulkEditing ? "primary-button compact-button" : "button-secondary compact-button"}
                  onClick=...`
- [YELLOW] `app-vNext/src/features/easylist/routes/EasyListEmailPage.tsx:330` - Icon-style button may need an accessible label.
  `<button className="primary-button" type="button" onClick={handleScan} disabled={isScanning}>`
- [YELLOW] `app-vNext/src/features/easylist/routes/EasyListEmailPage.tsx:380` - Icon-style button may need an accessible label.
  `<button className="primary-button" type="button" onClick={handleImportEmails} disabled={!importText.trim()}>`
- [YELLOW] `app-vNext/src/features/easynotes/routes/EasyNotesEditorPage.tsx:208` - Icon-style button may need an accessible label.
  `<button
            type="button"
            className={`button-secondary compact-button notes-review-action-button${actionsOpen ? " active" : ""}`}
            onClick={handleRev...`
- [YELLOW] `app-vNext/src/features/easynotes/routes/EasyNotesEditorPage.tsx:260` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary compact-button" onClick={handleProcessNote}>`
- [YELLOW] `app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx:184` - Icon-style button may need an accessible label.
  `<button
              type="button"
              className="notes-command-button"
              onClick={() => {`
- [YELLOW] `app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx:362` - Icon-style button may need an accessible label.
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
- [YELLOW] `app-vNext/src/features/easyprojects/routes/EasyProjectsHomePage.tsx:219` - Icon-style button may need an accessible label.
  `<button type="submit" className="primary-button" disabled={!newProjectTitle.trim()}>`
- [YELLOW] `app-vNext/src/features/easyprojects/routes/EasyProjectsHomePage.tsx:299` - Icon-style button may need an accessible label.
  `<button
                    type="submit"
                    className="primary-button"
                    disabled={isPlanning || (!plannerTitle.trim() && !plannerDescription.tr...`
- [YELLOW] `app-vNext/src/features/easyworkout/routes/EasyWorkoutLogPage.tsx:354` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary" onClick={parseWorkoutPaste} disabled={!workoutPaste.trim()}>`
- [YELLOW] `app-vNext/src/features/easyworkout/routes/EasyWorkoutLogPage.tsx:409` - Icon-style button may need an accessible label.
  `<button type="button" className="ghost-button compact-button" onClick={removeBlankExerciseBoxes}>`
- [YELLOW] `app-vNext/src/features/easyworkout/routes/EasyWorkoutLogPage.tsx:506` - Icon-style button may need an accessible label.
  `<button
                      type="button"
                      className="button-secondary"
                      onClick={() => {`
- [YELLOW] `app-vNext/src/features/experiments/AiCommandCenter.tsx:231` - Icon-style button may need an accessible label.
  `<button
              key={mock.prompt}
              type="button"
              onClick={() => {`
- [YELLOW] `app-vNext/src/features/experiments/UniversalCapture.tsx:763` - Icon-style button may need an accessible label.
  `<button
              key={value}
              type="button"
              className={`capture-mode-button${mode === value ? " active" : ""}`}
              onClick={() => {`
- [YELLOW] `app-vNext/src/features/hq/routes/CommandCenterPage.tsx:325` - Icon-style button may need an accessible label.
  `<button className="button-secondary" type="button" onClick={scheduleNextMove} disabled={!nextMove || !openWindows[0]}>`
- [YELLOW] `app-vNext/src/features/hq/routes/CommandCenterPage.tsx:369` - Icon-style button may need an accessible label.
  `<button className="primary-button" type="button" onClick={saveCommandTask}>`
- [YELLOW] `app-vNext/src/features/hq/routes/HQPage.tsx:453` - Icon-style button may need an accessible label.
  `<button type="button" className="hq-natural-capture" onClick={openNaturalCapture}>`
- [YELLOW] `app-vNext/src/features/settings/routes/SettingsPage.tsx:1296` - Icon-style button may need an accessible label.
  `<button type="button" className="primary-button" onClick={handleExportAll}>`
- [YELLOW] `app-vNext/src/features/settings/routes/SettingsPage.tsx:1299` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary" onClick={handleCopySummary}>`
- [YELLOW] `app-vNext/src/features/settings/routes/SettingsPage.tsx:1391` - Icon-style button may need an accessible label.
  `<button type="button" className="primary-button" onClick={handleOpenInstallShare}>`
- [YELLOW] `app-vNext/src/features/settings/routes/SettingsPage.tsx:1528` - Icon-style button may need an accessible label.
  `<button type="button" className="button-secondary" onClick={handleSendTestNotification}>`
- [INFO] `app-vNext/src/styles/globals.css:11143` - Reduced-motion handling is present.
  `@media (prefers-reduced-motion: reduce) {`

## Stop Or Continue
continue but patch accessibility warnings soon
