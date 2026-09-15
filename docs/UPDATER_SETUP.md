# PaperLayr Auto-Updater & Release Guide

PaperLayr includes in-app auto-update capabilities powered by Tauri v2 and GitHub Releases.

## How It Works

1. **Manual Check**:
   - Click the **Settings icon** (`⚙️`) in the top sidebar header (next to the search icon).
   - In the context menu, click **"Check for Updates..."**.
   - If a new version is published on GitHub, the Update dialog opens showing version changes and release notes, allows downloading with real-time progress, and prompts to restart the app.
   - If the app is already on the latest version, an up-to-date notification is shown.

2. **Automatic Startup Check**:
   - Whenever PaperLayr is opened, it automatically checks GitHub Releases in the background.
   - If a new version is available:
     - A blue update indicator badge appears on the Settings icon.
     - An update prompt is displayed allowing one-click download & update.
   - If the app is already up to date, the startup check is completely silent and non-intrusive.

---

## Setting Up GitHub Actions for Automatic Releases

The repository is configured with `.github/workflows/release.yml`. When you publish a release or push a version tag, GitHub Actions automatically builds the macOS universal app bundle, signs it with your private key, generates the `latest.json` manifest, and publishes them to GitHub Releases.

### 1. Configure GitHub Repository Secrets

Go to your repository settings on GitHub:
**`https://github.com/quirkysaad/PaperLayr/settings/secrets/actions`**

Add the following secret:

- **Name:** `TAURI_SIGNING_PRIVATE_KEY`
- **Value:** The content of your private key located at `~/.tauri/paperlayr.key`:
  ```
  dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5ClJXUlRZMEl5ZXNqcEpob2w5OGxVYXBTcEZhZkk1anpDRnFJS1JSREZ0bEFoSXpVdTd2b0FBQkFBQUFBQUFBQUFBQUlBQUFBQS9aMU53M1FWSWk2aHNvOGhSYS9meG9xYVRHenFzRzdzdVl3Q2dDL29BcEtaZmRCT0E4THNndW5UdTVIQjFpb2FzOVdvaHMxQW9BbHBUTE1ZOUc5cE1HQjNveSs2MGhNREdDbVZuMFlFakkyOHF5UGZxenNEZzFOUjNpSFJiWlMyaHd2d2FsWmRUUG89Cg==
  ```

*(If you set a password, also add `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, otherwise leave it unset).*

### 2. Publishing a New Release

Whenever you want to release a new version (for example, `0.1.1`):

1. Bump the version in `package.json` and `src-tauri/tauri.conf.json`:
   ```json
   "version": "0.1.1"
   ```
2. Commit your changes:
   ```bash
   git add .
   git commit -m "Release v0.1.1"
   ```
3. Create and push a tag:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```
4. GitHub Actions will trigger, build the macOS bundle, attach `latest.json`, `.tar.gz`, `.tar.gz.sig`, and `.dmg` to the release.
5. All installed PaperLayr applications will detect this release and update seamlessly!
