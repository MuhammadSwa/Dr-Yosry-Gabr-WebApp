# Deployment & Sync Documentation

This document explains how the YouTube data synchronization and GitHub Pages deployment work together for this static website.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Cache-Busting Strategy](#cache-busting-strategy)
- [Workflows](#workflows)
- [Setup Guide](#setup-guide)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

---

## Overview

This project uses a **dual-workflow system** that separates data synchronization from code deployment:

1. **Sync Workflow**: Fetches YouTube data every 3 hours and deploys updated data
2. **Deploy Workflow**: Deploys code changes when you push to the `main` branch

**Key Benefits:**
- ✅ No sync conflicts - `main` branch stays clean
- ✅ Independent operations - data updates without rebuilding
- ✅ Automatic cache-busting - browsers always get fresh data
- ✅ GitHub Actions handles everything automatically

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Repository Structure                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  main branch (your code)                                    │
│  ├── src/              ← React/Solid.js code               │
│  ├── public/data/      ← Static JSON files (ignored)       │
│  ├── scripts/sync.ts   ← YouTube sync script               │
│  └── .github/workflows/                                     │
│                                                              │
│  gh-pages branch (deployed site)                            │
│  ├── index.html        ← Built app                          │
│  ├── assets/           ← JS/CSS bundles                     │
│  ├── data/             ← Synced YouTube data                │
│  └── .nojekyll         ← Disables Jekyll processing         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────────┐
│  YouTube API     │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│  Sync Workflow (every 3 hours)                       │
│  1. Fetch videos/playlists                           │
│  2. Update public/data/*.json                        │
│  3. Build app with updated data                      │
│  4. Deploy to gh-pages                               │
└──────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│  gh-pages branch                                      │
│  ├── data/_sync.json     (lastSync: timestamp)       │
│  ├── data/index.json     (site metadata)             │
│  ├── data/videos/...     (paginated videos)          │
│  └── data/playlists/...  (by playlist)               │
└──────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│  Browser (user visits site)                          │
│  1. Fetch _sync.json?_=<now> (always fresh)          │
│  2. Read lastSync timestamp                          │
│  3. Fetch other JSON: index.json?v=<lastSync>        │
│  4. Browser caches until lastSync changes            │
└──────────────────────────────────────────────────────┘
```

---

## Cache-Busting Strategy

### The Problem
Browsers aggressively cache JSON files. When YouTube data updates, browsers might serve stale cached data for hours or days.

### The Solution
We use **timestamp-based cache-busting** that's independent of app rebuilds:

#### How It Works

1. **Sync Script Updates Timestamp**
   ```typescript
   // scripts/sync.ts
   const newState: SyncState = {
     lastSync: new Date().toISOString(),  // e.g., "2025-12-06T15:30:00Z"
     videoCount: allVideos.length,
     // ...
   }
   writeJson("public/data/_sync.json", newState)
   ```

2. **App Fetches Version on Load**
   ```typescript
   // src/lib/staticData.ts
   async function getDataVersion(): Promise<string> {
     // Always fetch _sync.json fresh (bypasses cache)
     const url = `${basePath}/data/_sync.json?_=${Date.now()}`
     const res = await fetch(url)
     const data = await res.json()
     
     // Convert lastSync to timestamp
     return new Date(data.lastSync).getTime().toString()
   }
   ```

3. **All JSON Requests Use Version**
   ```typescript
   // Append version to all data requests
   const version = await getDataVersion()
   fetch(`/data/index.json?v=${version}`)
   fetch(`/data/videos/date/page-1.json?v=${version}`)
   ```

#### Example Timeline

```
10:00 AM - Sync #1
├── _sync.json: { lastSync: "2025-12-06T10:00:00Z" }
├── Version: 1733486400000
└── Browser fetches: index.json?v=1733486400000

1:00 PM - Sync #2 (new videos found!)
├── _sync.json: { lastSync: "2025-12-06T13:00:00Z" }
├── Version: 1733497200000  ← Changed!
└── Browser fetches: index.json?v=1733497200000  ← Fresh data!

4:00 PM - Sync #3 (no changes)
├── _sync.json: { lastSync: "2025-12-06T16:00:00Z" }
├── Version: 1733508000000  ← Still changes
└── Browser re-validates and gets 304 Not Modified if no actual changes
```

### Why This Works

- ✅ **Independent**: Works even if app isn't rebuilt
- ✅ **Efficient**: Only `_sync.json` (~100 bytes) is fetched fresh
- ✅ **Reliable**: Uses existing file that's always updated
- ✅ **Standard**: Query parameter cache-busting is a proven technique
- ✅ **Smart**: Browsers still use cache when version hasn't changed

---

## Workflows

### 1. Sync YouTube Data (`sync-youtube.yml`)

**Triggers:**
- Every 3 hours: `0 */3 * * *`
- Manual: Click "Run workflow" in GitHub Actions
- On push: When `scripts/sync.ts` changes

**Process:**
```yaml
┌─────────────────────────────────────────────────────────┐
│ 1. Checkout main branch                                 │
│ 2. Setup Node.js + pnpm                                 │
│ 3. Install dependencies                                 │
│ 4. Run sync script (YOUTUBE_API_KEY from secrets)      │
│ 5. Check if data changed                                │
│    ├─ No changes → Stop ✓                               │
│    └─ Changes detected → Continue                       │
│ 6. Build static site (pnpm build)                       │
│ 7. Add .nojekyll to disable Jekyll                      │
│ 8. Deploy to gh-pages branch                            │
│    ├─ force_orphan: true (clean history)                │
│    └─ enable_jekyll: false                              │
└─────────────────────────────────────────────────────────┘
```

**Important Notes:**
- Does NOT commit to `main` branch (keeps it clean!)
- Only deploys if data actually changed
- Uses incremental sync when possible (faster)
- Full sync if playlists changed or first run

### 2. Build and Deploy (`deploy.yml`)

**Triggers:**
- Push to `main` branch (code changes only)
- Manual: Click "Run workflow" in GitHub Actions
- Ignores: Changes to `public/data/**` (handled by sync)

**Process:**
```yaml
┌─────────────────────────────────────────────────────────┐
│ 1. Checkout main branch                                 │
│ 2. Setup Node.js + pnpm                                 │
│ 3. Install dependencies                                 │
│ 4. Build static site (SKIP_SYNC=true)                   │
│ 5. Prepare for deployment                               │
│    ├─ Add .nojekyll                                     │
│    ├─ Create /study/index.html (SPA fallback)           │
│    ├─ Create /dashboard/index.html (SPA fallback)       │
│    └─ Create 404.html                                   │
│ 6. Deploy to gh-pages branch                            │
└─────────────────────────────────────────────────────────┘
```

**Important Notes:**
- Triggered by code changes, not data changes
- `paths-ignore: public/data/**` prevents duplicate deployments
- SPA fallback pages ensure client-side routing works

---

## Setup Guide

### Initial Setup

#### 1. Configure Repository Secrets

Go to: `Settings → Secrets and variables → Actions → New repository secret`

Add:
```
Name: YOUTUBE_API_KEY
Value: <your-youtube-api-key>
```

**Get a YouTube API Key:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. (Optional) Restrict key to YouTube Data API v3

#### 2. Configure GitHub Pages

Go to: `Settings → Pages`

Set:
```
Source: Deploy from a branch
Branch: gh-pages
Directory: / (root)
```

Click **Save**

#### 3. First Deployment

The `gh-pages` branch will be created automatically on first workflow run.

**Option A: Trigger Sync Workflow**
```bash
# Go to GitHub Actions tab
# Select "Sync YouTube Data"
# Click "Run workflow"
```

**Option B: Push to Main**
```bash
git add .
git commit -m "feat: initial setup"
git push origin main
# This triggers the deploy workflow
```

#### 4. Verify Deployment

After workflow completes (~2-5 minutes):

1. Check Actions tab for green checkmark ✓
2. Visit your site: `https://<username>.github.io/<repo-name>/`
3. Verify data loads correctly

---

## Troubleshooting

### Common Issues

#### 1. "Jekyll is processing my site"

**Symptoms:**
- Files with underscores (`_sync.json`) return 404
- CSS/JS assets missing
- Site doesn't load correctly

**Solution:**
Ensure `.nojekyll` file is created in deployment:
```yaml
# In both workflows
- name: Prepare for GitHub Pages
  run: |
    cd ./dist/client
    touch .nojekyll  ← This line is critical!
```

#### 2. "Browser serving cached data"

**Symptoms:**
- New videos don't appear
- Old video counts shown
- Data seems stale

**Check:**
1. Open DevTools → Network tab
2. Look for `_sync.json` request
3. Verify `lastSync` timestamp is recent
4. Check other requests have `?v=<timestamp>` parameter

**Solution:**
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear site data: DevTools → Application → Clear storage
- Wait for next sync cycle (every 3 hours)

#### 3. "Sync workflow not running"

**Check:**
1. Go to Actions tab
2. Check if workflow is scheduled
3. Verify `YOUTUBE_API_KEY` secret is set
4. Check workflow logs for errors

**Manual trigger:**
```bash
# Actions tab → "Sync YouTube Data" → "Run workflow"
```

#### 4. "Data not updating after sync"

**Debugging steps:**

1. Check sync workflow logs:
   ```
   Actions → Sync YouTube Data → Latest run
   Look for: "📦 Changes detected in static data"
   ```

2. Verify `_sync.json` was updated:
   ```
   Visit: https://<username>.github.io/<repo>/data/_sync.json
   Check: lastSync timestamp is recent
   ```

3. Check YouTube API quota:
   - [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services → YouTube Data API v3 → Quotas
   - Daily limit: 10,000 units
   - Sync uses ~3-10 units per run

#### 5. "Permission denied" errors

**Symptoms:**
```
Error: Resource not accessible by integration
```

**Solution:**
Update workflow permissions:
```yaml
permissions:
  contents: write  # Required for peaceiris/actions-gh-pages
```

#### 6. "Build fails on GitHub Actions but works locally"

**Common causes:**

1. **Missing environment variables:**
   ```yaml
   - name: Build static site
     env:
       YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
     run: pnpm build
   ```

2. **Node version mismatch:**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: '20'  # Match your local version
   ```

3. **Dependency cache issues:**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       cache: 'pnpm'  # Ensure this is set
   ```

---

## Development Workflow

### Day-to-Day Development

```bash
# 1. Work on features locally
git checkout -b feature/new-component
# ... make changes ...
git add .
git commit -m "feat: add new component"

# 2. Test locally
pnpm dev

# 3. Build locally to verify
pnpm build

# 4. Push to main
git checkout main
git merge feature/new-component
git push origin main

# 5. GitHub Actions automatically:
#    - Builds your app
#    - Deploys to gh-pages
#    - Site updates in ~2-5 minutes

# 6. NO NEED TO PULL!
#    Your main branch never has auto-commits
```

### Testing Sync Locally

```bash
# Set API key
export YOUTUBE_API_KEY="your-key-here"

# Run sync
pnpm sync

# Check generated files
ls -la public/data/
cat public/data/_sync.json

# Test in development
pnpm dev
```

### Manual Sync Trigger

Sometimes you want to sync immediately instead of waiting 3 hours:

```bash
# Option 1: Via GitHub UI
# Go to: Actions → "Sync YouTube Data" → "Run workflow"

# Option 2: Via GitHub CLI
gh workflow run sync-youtube.yml

# Option 3: Push sync script change
git commit --allow-empty -m "chore: trigger sync"
git push
```

### Deployment Preview

```bash
# Build locally
pnpm build

# Preview the built site
cd dist/client
python -m http.server 8000
# Visit: http://localhost:8000

# Check that data loads correctly
# Open DevTools and verify:
# - _sync.json loads
# - Other JSON files have ?v=<timestamp>
```

### Monitoring Sync Status

```bash
# Check last sync time
curl https://<username>.github.io/<repo>/data/_sync.json | jq .lastSync

# Check video count
curl https://<username>.github.io/<repo>/data/_sync.json | jq .videoCount

# View recent workflow runs
gh run list --workflow=sync-youtube.yml --limit 5

# View specific run logs
gh run view <run-id> --log
```

---

## Advanced Configuration

### Adjusting Sync Frequency

Edit `.github/workflows/sync-youtube.yml`:

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours instead of 3
    # - cron: '0 0 * * *'   # Daily at midnight UTC
    # - cron: '0 */1 * * *' # Every hour (use with caution!)
```

**Cron syntax:**
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

**Examples:**
- `0 */3 * * *` - Every 3 hours
- `0 0,12 * * *` - Twice daily (midnight & noon UTC)
- `0 0 * * 0` - Weekly on Sunday midnight

### Customizing Cache Behavior

In `src/lib/staticData.ts`:

```typescript
// Adjust cache size
const MAX_CACHE_SIZE = 100  // Increase for more caching

// Add selective cache bypass
async function fetchJson<T>(path: string, bypassCache = false): Promise<T> {
  if (!bypassCache && cache.has(path)) return cache.get(path) as T
  // ... rest of function
}
```

### Optimizing Build Time

1. **Skip dependencies that haven't changed:**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       cache: 'pnpm'  # Cache node_modules
   ```

2. **Parallel builds (if you add multiple sites):**
   ```yaml
   strategy:
     matrix:
       site: [main, blog, docs]
   ```

3. **Conditional deployment:**
   ```yaml
   - name: Check if rebuild needed
     id: check
     run: |
       if git diff --quiet HEAD~1 src/; then
         echo "skip=true" >> $GITHUB_OUTPUT
       fi
   ```

---

## File Structure Reference

```
project/
├── .github/workflows/
│   ├── sync-youtube.yml      # Data sync workflow
│   └── deploy.yml            # Code deployment workflow
│
├── public/
│   └── data/                 # Generated by sync script
│       ├── _sync.json        # Sync metadata + cache version
│       ├── index.json        # Site index
│       ├── videos/           # Paginated videos
│       │   ├── date/         # Sorted by date
│       │   ├── oldest/       # Sorted by oldest
│       │   └── views/        # Sorted by views
│       ├── categories/       # By category
│       │   ├── تفسير/
│       │   ├── حديث/
│       │   └── ...
│       ├── playlists/        # By playlist
│       │   └── <playlist-id>/
│       ├── video/            # Individual video details
│       │   └── <video-id>.json
│       └── search/           # Search indices
│           ├── manifest.json
│           ├── chunk-1.json
│           └── ...
│
├── scripts/
│   └── sync.ts              # YouTube sync script
│
├── src/
│   └── lib/
│       └── staticData.ts    # Data fetching + cache-busting
│
└── dist/client/             # Built site (deployed to gh-pages)
    ├── index.html
    ├── assets/
    ├── data/                # Copied from public/data/
    └── .nojekyll            # Disables Jekyll
```

---

## Key Concepts Summary

### 1. Separation of Concerns
- **`main` branch**: Your source code
- **`gh-pages` branch**: Deployed site
- **Never mix**: main stays clean, gh-pages is auto-managed

### 2. Cache-Busting Independence
- Data version comes from `_sync.json`
- Updates on every sync
- Works without app rebuild
- Single source of truth

### 3. Efficient Syncing
- Incremental updates when possible
- Only fetches new videos
- Skips deployment if no changes
- Respects YouTube API quotas

### 4. Browser Cache Strategy
- `_sync.json`: Always fetched fresh (100 bytes)
- Other JSON: Cached until version changes
- Static assets: Long-term caching (has content hashes)
- HTML: Short caching (SPA entry point)

### 5. Workflow Coordination
- Sync workflow: Data updates → Deploy
- Deploy workflow: Code updates → Deploy
- No conflicts: Both write to gh-pages safely
- Idempotent: Safe to run multiple times

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [Cache-Busting Strategies](https://css-tricks.com/strategies-for-cache-busting-css/)

---

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review workflow logs in Actions tab
3. Verify all secrets are set correctly
4. Check GitHub Pages configuration
5. Review browser DevTools Network tab

**Common Commands:**
```bash
# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Trigger workflow
gh workflow run sync-youtube.yml

# Check secrets
gh secret list
```
