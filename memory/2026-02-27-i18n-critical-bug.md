# 2026-02-27 i18n Language Switcher Critical Bug

## Session Summary
**Focus:** Addressing a critical bug where language selection (manual or automatic) is not persisting and reverts to Portuguese.
**Status:** Immediate investigation initiated for i18n persistence logic.

## i18n Language Switcher Bug 🚨 (CRITICAL)
- **User Report:**
  - Automatic translation (based on country/browser) is not working.
  - Manual language selection requires page refresh, but after refresh, the language reverts to Portuguese.
- **Impact:** Core multi-language functionality is completely broken. This is a top-priority bug, blocking all other i18n efforts and affecting user experience globally.
- **Diagnosis Strategy:**
  1.  **`frontend/src/i18n/index.js`:** Check language detection (`i18next-browser-languagedetector`) and persistence configuration (`localStorage` usage).
  2.  **`frontend/src/components/LanguageSwitcher.jsx`:** Verify how `i18n.changeLanguage()` is called and if `localStorage` is being explicitly set/read here.
  3.  **`App.jsx`:** Look for any global state or `useEffect` logic that might be interfering with i18n initialization or causing unintended reloads/resets.

## Pending Tasks (Paused)
- **Mural Fixes:**
  - Upload of video not working.
  - Images of posts not loading.
  - Emojis corrupted in nav.
  - Add delete button in each post.
  - Video fullscreen on click.
  - TikTok-style vertical scroll feed.
  - Sound on/off when changing video.
- **Dashboard Integration:** Integration in progress, i18n translations generated but not yet applied to JSON files.
- **Build Process Debugging:** `npm run build` is still problematic, but user has offered to handle builds, allowing me to focus on code fixes.

## Next Actions (Immediate Priority: i18n Bug)
1.  Read `frontend/src/i18n/index.js` to inspect i18n configuration.
2.  Read `frontend/src/components/LanguageSwitcher.jsx` to see language change logic.
3.  Read `App.jsx` to check for global i18n interference.

## Status: 🔥 Critical i18n language bug investigation underway. All other tasks paused.
