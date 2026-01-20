# Changelog

## [1.2.0] - 2026-01-19

### Added

- **Eye Break Reminders (20-20-20 Rule)**
  - Customizable work intervals (15-60 minutes, default 20)
  - Configurable break duration (10-60 seconds, default 20)
  - Status bar countdown timer with visual indicators
  - Random bilingual eye health tips (EN/ES) with each reminder
  - Idle detection to pause timer when not actively coding
  - Snooze functionality (5 minutes)

- **New Commands**
  - `Harmonia Vision: Toggle Eye Break Reminders` - Enable/disable reminders
  - `Harmonia Vision: Take Eye Break Now` - Trigger immediate break
  - `Harmonia Vision: Snooze Eye Break` - Snooze current reminder

- **New Settings**
  - `harmoniaVision.pause.enabled` - Enable eye break reminders
  - `harmoniaVision.pause.workIntervalMinutes` - Time between breaks
  - `harmoniaVision.pause.breakDurationSeconds` - Break duration
  - `harmoniaVision.pause.showStatusBar` - Show/hide status bar countdown
  - `harmoniaVision.pause.pauseWhenIdle` - Pause timer when inactive

- **Calibrator Panel Integration**
  - New "Eye Break Reminders" section in the Calibrator UI
  - Toggle switch to enable/disable reminders
  - Sliders for work interval and break duration
  - Checkboxes for status bar and idle detection options
  - "Take Break Now" button for manual breaks
  - Real-time status badge (Active/Inactive/On Break)

### Technical

- Added `PauseManager` class for timer and notification logic
- Added `pauseTips.ts` with 15 bilingual eye health tips
- Activity tracking via editor events for idle detection
- State persistence across VS Code sessions via `globalState`

---

## [1.1.0] - 2026-01-18

### Added

- **Line Highlight Control**
  - New `editor.renderLineHighlight` setting support
  - Options: All (default), Line Only, Gutter Only, None
  - Helps users with light sensitivity reduce visual distractions

### Improved

- **Live Preview**
  - Added line numbers gutter to side-by-side comparison
  - Preview now shows line highlight effect in real-time
  - More accurate representation of VS Code editor appearance

### Technical

- Added `LineHighlightType` for type-safe highlight mode handling
- Updated settings manager to read/write `renderLineHighlight`
- Enhanced webview with gutter styling using VS Code theme variables

---

## [1.0.0] - 2026-01-17

### Added

- **Visual Profile Assessment**
  - Support for 6 visual conditions:
    - Myopia (nearsightedness)
    - Astigmatism
    - Eye strain / fatigue
    - Blur / Ghosting
    - Light sensitivity
    - Visual crowding
  - Clear interactive selection states with immediate feedback

- **Prescription Input (Optional)**
  - Sphere (SPH) and Cylinder (CYL) fields
  - Decimal validation (up to 2 decimal places)
  - Tooltips explaining each value and when to use it

- **Recommendation Engine**
  - Personalized editor setting recommendations based on your selected profile
  - Conservative, explainable heuristics designed to avoid extreme values
  - Human-readable rationale per recommended setting

- **Editor Settings Controls**
  - Font Size (12-32px)
  - Line Height (Auto-2.2x)
  - Letter Spacing (0-1.5px)
  - Font Weight (300-700)
  - Cursor Width (1-5px)

- **Live Preview**
  - Side-by-side comparison (Original vs Preview)
  - Real-time preview updates while adjusting controls

- **Safe Apply Workflow**
  - Automatic settings snapshot on extension open
  - Preview button to test settings in the editor
  - Save button to commit changes
  - Revert button to restore the last snapshot

- **Internationalization (i18n)**
  - English support
  - Spanish support
  - Auto-detection based on VS Code language

- **Medical Disclaimer**
  - Clear notice that this extension is not a substitute for professional eye care
  - Recommendation to consult an optometrist for persistent visual discomfort

- **Modern UI**
  - Clean, accessible interface built for VS Code Webviews
  - Theme-aware styling using VS Code CSS variables
  - Consistent borders, spacing, and focus states
  - Responsive layout

### Technical

- TypeScript-based implementation
- Webview panel with Content Security Policy (CSP)
- Debounced setting updates for responsiveness
- Snapshot-based settings management (backup/restore)
