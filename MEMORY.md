# Long-Term Memory - Sigo com Fé Project

## Project Overview
**Sigo com Fé** — A Christian community social platform built with React + Vite + Node.js + PostgreSQL.
- Frontend hosted on Vercel (auto-deploy on git push to master)
- Backend on Render with PostgreSQL database
- Real-time notifications via OpenClaw API integration

## Core Architecture

### Frontend (React + Vite)
- **i18n**: Auto-detects language from localStorage → browser navigator (pt-BR, es, en, de, fr, ro, ru)
  - Maps regional variants to base languages (pt-BR → pt, es-ES → es)
  - LanguageSwitcher component provides dropdown for manual selection
  
- **Design System**: Dark mode with golden accents
  - Background: #0f0f1a (very dark), #1a1a2e (accent dark)
  - Text: #fff (white), #daa520 (golden accents)
  - High contrast, accessibility-first
  
- **Key Pages**:
  - `pages/Home.jsx`: Dark gradient hero, features grid, testimonies, verse of day
  - `pages/MuralGrid.jsx`: Instagram-style 3-column grid (desktop), responsive to tablet (2 cols) and mobile (1 col)
  - `pages/Register.jsx`: Multi-step registration with Google Analytics conversion tracking
  - `components/LanguageSwitcher.jsx`: 7-language dropdown
  
- **Styling**: Mobile-first responsive design in `styles/main.css`
  - Grid animations: slideInRight for mobile menu
  - Media queries: `@media (max-width: 768px)` for tablet/mobile
  
### Backend (Node.js + PostgreSQL)
- **OpenClaw Integration**: GET `/api/openclaw/users/new` endpoint
  - Requires Bearer auth: `OPENCLAW_API_TOKEN=sigocomfe2026` (in .env)
  - Notifies OpenClaw of new user registrations
  - Health check endpoint available
  
- **Authentication**: OAuth (Google, Facebook) + email-based registration
  
## Media Upload System
- **Provider**: Cloudinary (direct browser upload, no server relay)
- **Endpoint**: `https://api.cloudinary.com/v1_1/degxiuf43/{resourceType}/upload`
- **Preset**: `sigo_com_fe` (unsigned upload)
- **Folder**: `sigo-com-fe/posts`
- **File Limits**: Images 50MB, Videos 500MB, Audio 100MB
- **Types Supported**: Photo, video, audio, YouTube URL embeds

## Google Analytics Integration
- **Conversion Tracking**: `trackSignUpEvent()` helper in Register.jsx
- **Events Fired**:
  - `sign_up` event (method: 'email') on account creation (step 1)
  - `login` event (method: 'email') on photo upload completion (step 2)
- **Safety**: Checks `window.gtag` before firing to prevent runtime errors
- **TODO**: Verify OAuth method tracking (Google/Facebook logins)

## Recent Accomplishments (Multi-Session Push)
- ✅ Multi-language auto-detection with fallback to Portuguese (7 languages)
- ✅ Mural redesigned as Instagram-style grid (3 cols desktop, responsive mobile)
- ✅ Mobile menu hamburger fix (nav-links--open class toggle)
- ✅ Home page dark mode redesign with hero section
- ✅ Comprehensive media upload (photo/video/audio/URL) to Mural
- ✅ Cloudinary integration for media hosting with optimized streaming (`q_auto,vc_auto`)
- ✅ OpenClaw API endpoint created, tested, and integrated with cron job (hourly new user checks)
- ✅ Modal styling (dark background, white text, golden borders) and responsive mobile fix
- ✅ Google Analytics conversion events in registration flow
- ✅ Build verification (npm run build successful, 1807 modules, 0 critical errors)
- ✅ Fixed backend API issues (merge conflicts, SQL table names, endpoint bugs) — 6 errors resolved
- ✅ Added "Minha Música" feature (select from user library, separate audio_url field)
- ✅ Fixed upload freezing (spinner feedback, 10-minute timeout, chunked uploads for >100MB)
- ✅ Fixed video playback flickering (optimized preload, Cloudinary streaming, proper CORS)
- ✅ Separated music from video (audio_url vs media_url) — allows simultaneous video + music
- ✅ ~15+ commits pushed to master

## Critical Files
- `frontend/src/pages/Home.jsx` — Dark hero, features, testimonies
- `frontend/src/pages/MuralGrid.jsx` — Instagram grid, modal, media upload
- `frontend/src/pages/Register.jsx` — Multi-step, GA tracking, OAuth
- `frontend/src/i18n/index.js` — Language detection logic
- `backend/src/routes/openclaw.js` — New user notifications
- `backend/.env.example` — OPENCLAW_API_TOKEN reference

## Current Blockers
- **UTF-8 Encoding Issue**: Emojis displaying as mojibake (ðŸ"´, ðŸ"-,  âœ¨, etc.) in:
  - `frontend/src/App.jsx` navigation menu and action bar buttons
  - `frontend/src/i18n/pt.json`, `es.json`, `de.json` (Portuguese works fine)
  - Root cause: File encoding mismatch (mixed UTF-8 with/without BOM)
  - Status: Identified specific corrupted characters; awaiting consistent file encoding fix
  - Workaround: Users can manually select Portuguese from language switcher

## Next Steps
1. **Fix UTF-8 encoding in App.jsx and translation files**:
   - Re-save all .jsx and .json files with consistent UTF-8 encoding
   - Verify proper emoji rendering in production after fix
2. **Test end-to-end**: Video + music uploads, playback on 4G, mobile responsiveness
3. **Monitor cron job**: Verify hourly OpenClaw new user check continues working
4. **Verify GA tracking**: Real device test for OAuth method tracking

## Key Decisions
- Dark mode chosen for contrast and modern aesthetic
- Regional language variants mapped to base languages in i18n
- Direct Cloudinary upload to reduce server load
- Google Analytics conversion events at critical milestones (account + profile completion)
- Fixed duplicate margin in Home.jsx that was blocking build

## Deploy Notes
- Auto-deploy on push to `master` branch
- Render backend rebuild time: 2-3 minutes
- Vercel frontend deployment: 1-2 minutes
- Current build status: ✅ Clean, no critical errors
