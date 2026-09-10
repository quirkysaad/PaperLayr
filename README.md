# PaperLayr

> **A fast, elegant, local-first desktop workspace and note-taking app designed for distraction-free thought capture, hierarchical knowledge organization, and floating desktop widgets.**

Built natively with **Tauri v2**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Tiptap**.

---

## ✨ Features

### 🗂️ Spaces & Hierarchical Organization
- **Color-Coded Spaces**: Organize projects, work, and personal notes into dedicated, color-accented workspaces.
- **Infinite Note Nesting**: Nest documents within documents to create deep, structured hierarchies without clutter.
- **Visual Space Views**: Overview cards for each space displaying last-modified dates, favorite badges, and quick-add actions.
- **Favorites & Starred Notes**: Star frequently accessed documents to keep them pinned at the top of your sidebar.
- **Reorganize on the Fly**: Move notes across spaces, duplicate notes, rename inline, or delete with safe cascade cleanup.

### ✍️ Block-Based Rich Text Editor
- **Powered by Tiptap & ProseMirror**: Fluid, responsive editing experience with zero lag.
- **Slash Commands (`/`)**: Instantly insert structural blocks:
  - Headings (`H1`, `H2`, `H3`)
  - Interactive Task / To-Do lists with checkboxes
  - Bulleted & Numbered lists
  - Quotes & Code blocks
  - Horizontal dividers & Images
- **Floating Bubble Menu**: Highlight any text selection to adjust font size (8px–56px), bold, italic, underline, strikethrough, inline code, custom text colors, and highlights.
- **Media & Images**: Drag and drop images directly into notes or paste from clipboard with inline previews.
- **Smart Paste Sanitization**: Automatically detects irregular line breaks and trailing non-breaking spaces (`<br>` / `&nbsp;`), prompting you to either strip redundant whitespace or keep original formatting.

### 📌 Floating Desktop Widgets & Global Quick Capture
- **System-Wide Quick Capture (`Cmd + Ctrl + N`)**: Summon a translucent, floating capture pad anywhere across macOS without bringing the main app window into focus. Capture thoughts instantly and save them directly to your Captures inbox.
- **Pin Notes to Desktop**: Pin any document as an independent floating widget (`alwaysOnTop`, frameless, translucent) to keep critical tasks or reference notes always visible while working.
- **Real-Time Cross-Window Sync**: Edits and title updates in floating widgets sync bi-directionally with the main application window in real time via Tauri’s native event system.
- **System Tray Integration**: Minimize to the menu bar tray when the main window is closed, keeping the app lightweight and instantly accessible.

### ⚡ Power Navigation & Search
- **Browser-Style Tabs**: Work across multiple documents simultaneously with smooth tab switching, tab closing, and a dedicated new tab launcher.
- **Instant Global Search (`Cmd + K`)**: Fuzzy search across all workspace names, note titles, and note body contents with keyboard-driven navigation.
- **Resizable Sidebar**: Collapse with `Cmd + .` or drag the sidebar border to customize your working width (200px–480px).
- **Breadcrumb Trails**: Trace document hierarchy and jump between parents or workspace roots in a single click.

### 🔒 Privacy & Local-First Architecture
- **100% Offline & Private**: Notes and spaces are persisted locally using IndexedDB (`idb-keyval`) paired with Zustand state persistence. No remote server lock-in or required accounts.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Cmd</kbd> + <kbd>Ctrl</kbd> + <kbd>N</kbd> | **Global Quick Capture** (system-wide floating widget) |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>N</kbd> | New note in active space |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd> | Create new space |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open global search (notes & spaces) |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>.</kbd> | Toggle sidebar visibility |
| <kbd>/</kbd> | Open slash command palette in editor |
| <kbd>Esc</kbd> | Close modals / search dialog / slash menu |

---

## 🛠️ Tech Stack

- **Desktop Framework**: [Tauri v2](https://tauri.app/) (Rust)
- **UI & Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Editor Engine**: [Tiptap v3](https://tiptap.dev/) / [ProseMirror](https://prosemirror.net/)
- **State Management & Persistence**: [Zustand](https://github.com/pmndrs/zustand) with [idb-keyval](https://github.com/jakearchibald/idb-keyval)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
1. **Node.js**: >= 18.x ([Node.js Downloads](https://nodejs.org/))
2. **Rust & Cargo**: >= 1.77 ([rustup.rs](https://rustup.rs/))
3. **OS-specific Tauri dependencies**: Check the [Tauri v2 Prerequisites Guide](https://v2.tauri.app/start/prerequisites/) for your platform (macOS Command Line Tools, Linux webkit2gtk, or Windows C++ build tools).

### Installation

Clone the repository and install npm packages:

```bash
git clone https://github.com/yourusername/PaperLayr.git
cd PaperLayr
npm install
```

### Running in Development

Run the desktop application in development mode with hot-reloading:

```bash
npm run tauri dev
```

If you wish to run only the Vite web client in your browser:

```bash
npm run dev
```

### Production Build

To compile and package the desktop binary for your operating system:

```bash
npm run tauri build
```

The compiled release packages (such as `.dmg` / `.app` on macOS, `.deb` / `.AppImage` on Linux, or `.msi` on Windows) will be located in `src-tauri/target/release/bundle/`.

---

## 📂 Project Structure

```text
PaperLayr/
├── src/
│   ├── components/
│   │   ├── editor/              # Tiptap extensions (Slash commands, BubbleMenu, CustomImage, etc.)
│   │   ├── ConfirmModal.tsx     # Reusable confirmation dialogs
│   │   ├── EmptyState.tsx       # Fallback / blank canvas views
│   │   ├── MainContent.tsx      # Core container switching between SpaceView and NoteEditor
│   │   ├── NoteEditor.tsx       # Document editor with breadcrumbs & pin-to-desktop action
│   │   ├── Search.tsx           # Command-palette style search modal (Cmd+K)
│   │   ├── Sidebar.tsx          # Resizable navigation tree, favorites, and space manager
│   │   ├── SpaceModal.tsx       # Space creation and edit modal with color palette
│   │   ├── SpaceView.tsx        # Grid overview of notes inside a space
│   │   ├── TabBar.tsx           # Browser-style document tabs
│   │   └── Widget.tsx           # Floating pinned note & Quick Capture desktop widget
│   ├── store.ts                 # Zustand store with IndexedDB persistence
│   ├── types.ts                 # Core TypeScript data definitions
│   ├── App.tsx                  # Root application router & global event listeners
│   └── main.tsx                 # React DOM mount point
├── src-tauri/                   # Rust backend (Tauri v2 configuration, window management, tray)
│   ├── src/
│   │   ├── lib.rs               # Global shortcuts, tray menu, window visibility handling
│   │   └── main.rs              # Application entry point
│   └── tauri.conf.json          # Tauri configuration (permissions, window definitions)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
