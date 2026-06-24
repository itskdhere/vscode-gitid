# Change Log

All notable changes to the **GitID** (itskdhere.gitid) extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-06-24

### Added

- **Global Profile Node in Sidebar**: Added a dedicated "Global Profile" node under the Local profile list in the Sidebar Tree View. This node displays the current global Git configuration (Name, Email, etc.) and offers a one-click command to clear local workspace configurations to inherit global settings.
- **Visual Scope Distinction**: Standardized the display format of active profile scopes in both the Status Bar and Tree View from parentheses `(Local)`/`(Global)` to brackets `[Local]`/`[Global]`.
- **Context-Key Integration**: Introduced the VS Code context key `gitid:isLocalScope` to dynamically track whether the active workspace Git configuration is local, facilitating advanced menu/keybinding conditional display.
- **Global Config Service**: Implemented a new service method `getGlobalConfig()` to robustly read global Git variables using the Git CLI.
- **Dependency Updates**: Bumped `esbuild` dependency.

## [1.1.2] - 2026-06-09

### Added

- **Status Bar Update Caching**: Implemented intelligent caching of status bar items to avoid redundant Git CLI executions, improving overall extension performance.
- **On-Demand Force Refresh**: Integrated force-refresh triggers during critical actions (switching, creating, editing, deleting, or resetting profiles) to ensure status bar indicators stay instantly in sync.

## [1.1.1] - 2026-05-30

### Fixed

- **VS Code Engine Compatibility**: Downgraded target VS Code engine to `^1.107.0` (with corresponding `@types/vscode` updates) to support older VS Code builds, including specialized agentic runtime environments like Antigravity.
- **Sidebar View Improvements**: Renamed the sidebar tree view panel from "Profiles" to "GitID" for better brand alignment.
- **Action Menu Ordering**: Fixed and standardized the ordering of sidebar title actions (Create first, then Refresh) and context-menu actions (Apply, Edit, and then Delete) using explicit group indexing.
- **Status Bar Alignment**: Adjusted the status bar item placement priority slightly to `100.05` for optimized layout behavior.

## [1.1.0] - 2026-05-28

### Added

- **"Use Global Profile" Action**:
  - Added a new command `gitid.useGlobalProfile` to easily clear local workspace Git identity configurations (`user.name`, `user.email`, `user.signingkey`, `commit.gpgsign`), enabling the workspace to inherit global settings.
  - Fully integrated into the Switch Profile QuickPick menu, the Sidebar Tree View context menu (on the Scope child node), and the Command Palette.
- **Smart Global Overriding Detection**:
  - When applying a profile globally while a local identity is active, GitID now detects this conflict and prompts you to clear local workspace settings to let the global profile take effect.
- **Unified Icons & UX Improvements**:
  - Modernized the QuickPick profile switcher with native icons (`iconPath`), using a green checkmark icon for the active profile, `circle-outline` for other profiles, and themed icons for management shortcuts.
  - Active configurations now explicitly display the applied scope: e.g., `GitID: <alias> (Local)` or `GitID: <alias> (Global)` in the Status Bar, Sidebar Tree View, and QuickPick menu.

## [1.0.0] - 2026-05-25

### Added

- **Sidebar Integration**: Added a beautiful interactive Tree View in the Activity Bar (`gitid-sidebar`) using a custom icon (`assets/sidebar.svg`).
- **Interactive Profiles Tree**: Shows all saved profiles and active workspace profiles. Expanded profile nodes show Name, Email, GPG status, GPG key, and applied scope.
- **Drag-and-Drop Reordering**: Implemented full `vscode.TreeDragAndDropController` support, allowing users to drag and drop profiles inside the Sidebar Tree to persistently reorder them in the list.
- **Profile Switching Scopes**: Supports applying Git profiles either **Globally** (machine-wide in `~/.git/config`) or **Locally** (current workspace in `.git/config`).
- **Automatic Unregistered Detection**: Automatically notices if the active Git config in the current workspace does not match a saved profile, offering a 1-click option to capture and register it.
- **GPG Signing Support**: Built-in support to specify GPG signing keys (`user.signingkey`) and toggle cryptographic commit verification (`commit.gpgsign` = true/false).
- **Status Bar Widget**: Integrates a clean indicator displaying the current active profile alias. Clicking switches profiles, while hovering displays a rich tooltip showing all active Git variables.
- **Command Palette & Sidebar Context Actions**:
  - `gitid.switchProfile` (Switch Git Profile)
  - `gitid.createProfile` (Create Git Profile)
  - `gitid.manageProfiles` (Manage Git Profiles)
  - `gitid.saveActiveAsProfile` (Register Active Profile)
  - `gitid.refreshTree` (Refresh GitID Profiles)
- **Automatic Environment Observers**: Listens for changes to the active editor or workspace folder to instantly keep status bar widgets and sidebars in sync.
