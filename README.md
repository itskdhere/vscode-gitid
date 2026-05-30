<h1 align="center">
  <img src="assets/icon.png" alt="GitID Logo" width="96">
  <br>
  <b>GitID</b>
</h1>

<p align="center">
  <b>Manage and Switch Multiple Git Identities</b>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=itskdhere.gitid" title="Visual Studio Marketplace">
    <img src="https://vsmarketplacebadges.dev/version/itskdhere.gitid.svg?style=for-the-badge&color=blue" alt="Visual Studio Marketplace Version" >
  </a>
  <a href="https://open-vsx.org/extension/itskdhere/gitid" title="Open VSX Registry">
    <img alt="Open VSX Registry Version" src="https://img.shields.io/open-vsx/v/itskdhere/gitid?style=for-the-badge&label=Open%20VSX%20Registry&color=purple">
  </a>
</p>

## Overview

**GitID** is a lightweight all-in-one VS Code extension designed to simplify handling multiple Git profiles on the same machine. Whether you are switching between work, personal, or freelance configurations, GitID lets you manage and apply Git configurations (user name, email, GPG signing keys, and commit signing preferences) both **locally** (per-workspace) and **globally** (across your machine) in just one click.

## Features

- **Interactive Tree View Sidebar**: A dedicated tab in the Activity Bar showing all your registered profiles, active Git status, and configuration details inline.
- **Drag-and-Drop Reordering**: Persistently rearrange profiles in the sidebar by simply dragging and dropping items.
- **Automatic "Unregistered" Detection**: Auto-detects if the current workspace or global Git configuration does not match any registered profile and offers a 1-click shortcut to register it instantly.
- **Instant Status Bar Widget**: Always know which Git identity is active (e.g., `GitID: Work` or `GitID: Personal`). Hover for a rich tooltip of active settings, or click to switch.
- **Robust GPG Signing Support**: Built-in options to configure GPG keys (`user.signingkey`) and toggle cryptographic commit verification (`commit.gpgsign = true/false`).
- **Flexible Scopes**: Apply any profile **Globally** (default machine-wide) or **Locally** (isolated within your active project workspace folder).

## Interactive Elements & Views

### 1. The GitID Sidebar View

Located under the **Account/Profiles** icon in your Activity Bar, the **GitID Profiles** tree provides a clean dashboard:

- **Active Status indicator**: Current active profiles are marked with a green checkmark `✓`.
- **Expandable details**: Collapse/Expand any profile to view its underlying **Name**, **Email**, **GPG Signing (Enabled/Disabled)**, **Key**, and the applied **Scope** (Local vs. Global) in real time.
- **Inline Actions**: Hover over profiles to access quick actions directly:
  - Apply Profile `(✓)`
  - Edit Profile `(pencil)`
  - Delete Profile `(trash)`

### 2. Status Bar Widget

Keep track of your environment with the status bar item:

- Displays `GitID: <Alias>` (e.g. `GitID: Personal`).
- **Rich Hover Tooltip**: Displays the complete active Git state (Name, Email, GPG state, Key, and active config scope).
- **Click Action**: Opens the Quick Pick menu instantly to switch profiles.

## Command Palette Reference

All features are also fully accessible via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command ID                  | Command Title                      | Description                                                               |
| :-------------------------- | :--------------------------------- | :------------------------------------------------------------------------ |
| `gitid.switchProfile`       | **GitID: Switch Git Profile**      | Open Quick Pick to switch active profiles or trigger creation/management. |
| `gitid.createProfile`       | **GitID: Create Git Profile**      | Interactively setup a new profile (name, email, GPG signing settings).    |
| `gitid.manageProfiles`      | **GitID: Manage Git Profiles**     | Opens a menu to edit, delete or add Git identities.                       |
| `gitid.saveActiveAsProfile` | **GitID: Register Active Profile** | Save your current workspace's Git setup as a new registered profile.      |
| `gitid.refreshTree`         | **GitID: Refresh GitID Profiles**  | Forces an update of the active profiles tree and status bar.              |
| `gitid.useGlobalProfile`    | **GitID: Use Global Profile**      | Clear local workspace Git configuration to inherit global settings.       |

## Getting Started

### 1. Installation

Install the extension via the **VS Code Marketplace** by searching for `GitID` or run in your terminal:

```bash
ext install itskdhere.gitid
```

### 2. Creating Your First Profile

1. Click the **GitID** sidebar icon or run `GitID: Create Git Profile` from the command palette.
2. Fill in the prompts:
   - **Profile Alias**: A short descriptive name (e.g., `Work`, `Personal`, `Freelance`).
   - **Git Name**: The name shown in your Git commits (`user.name`).
   - **Git Email**: The email linked to your Git host (`user.email`).
   - **Signing Key (Optional)**: Your GPG signing key ID (leave blank if not using GPG).
   - **Enable GPG Signing**: Choose if commits should be cryptographically signed (`commit.gpgsign`).

### 3. Switching Profiles

- Click the `GitID` item in the status bar at the bottom-left of the screen.
- Alternatively, run `GitID: Switch Git Profile` in the command palette.
- Select the profile you want to apply, and choose whether to apply it **Globally** (all projects) or **Locally** (this workspace folder only).

## Extension Settings & Storage

- **No bulky workspace files**: GitID manages all configurations through VS Code's secure `globalState`, ensuring your profile list is accessible across all workspaces on your machine without cluttering your code repositories.
- **Direct Git integration**: When you switch profiles, GitID invokes the system `git` CLI directly in your workspace directory (or globally), meaning it works seamlessly with terminal commands, the VS Code Source Control panel, and Git clients.

## Requirements & Prerequisites

- **Git Installed**: The `git` command-line tool must be installed and available on your system's PATH.
- **Open Workspace (for Local configuration)**: Applying configurations _locally_ requires a workspace folder or project to be open so GitID can target `.git/config`.

## Known Issues

- **Terminal caching**: If you have an active terminal pane open in VS Code, Git environment variables (like local user.name) are updated instantly in the `.git/config`, but some CLI-based tools might cache states until a new shell is launched.
- **Non-Git directories**: Local profiles cannot be set in folders that are not initialized with Git. Run `git init` first.

## Release Notes

### 1.1.0

- Added a new command "gitid.useGlobalProfile" to easily clear local workspace Git identity configurations, allowing it to inherit global settings.
- Fully integrated into the Switch Profile QuickPick menu and the Sidebar Tree View context menu (on the Scope child node).
- Smart global override detection: prompts to clear local workspace settings when applying a global profile if a conflicting local identity is active.
- Redesigned the QuickPick profile switcher with native VS Code icons for a more premium visual experience.
- Explicitly display the active configuration scope (Local/Global) in the status bar, sidebar tree view, and QuickPick menu.

### 1.0.0

- Initial release of GitID.
- Core interactive Sidebar tree view showing registered/active configurations.
- Global and Local profile switching.
- Full GPG/Commit Signing configuration integration.
- Interactive CLI status monitoring and instant status bar updates.
- Persistently saved profiles using VS Code global state storage.
- Drag-and-drop reordering of profiles in the Sidebar.

<br>

<p align="center">
  <a href="https://youtu.be/dQw4w9WgXcQ">🧩</a>
</p>
