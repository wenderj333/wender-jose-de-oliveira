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

## Recent Accomplishments (This Session)
- ✅ Multi-language auto-detection with fallback to Portuguese
- ✅ Mural redesigned as Instagram-style grid (3 cols desktop, responsive mobile)
- ✅ Mobile menu hamburger fix (nav-links--open class toggle)
- ✅ Home page dark mode redesign with hero section
- ✅ Comprehensive media upload (photo/video/audio/URL) to Mural
- ✅ Cloudinary integration for media hosting
- ✅ OpenClaw API endpoint created and tested
- ✅ Modal styling (dark background, white text, golden borders)
- ✅ Google Analytics conversion events in registration flow
- ✅ Build verification (npm run build successful, 1807 modules, 0 critical errors)
- ✅ 11 commits pushed to master

## Critical Files
- `frontend/src/pages/Home.jsx` — Dark hero, features, testimonies
- `frontend/src/pages/MuralGrid.jsx` — Instagram grid, modal, media upload
- `frontend/src/pages/Register.jsx` — Multi-step, GA tracking, OAuth
- `frontend/src/i18n/index.js` — Language detection logic
- `backend/src/routes/openclaw.js` — New user notifications
- `backend/.env.example` — OPENCLAW_API_TOKEN reference

## Next Steps
1. Verify Google Analytics OAuth method tracking (real device test)
2. Test registration flow end-to-end on mobile/desktop
3. Monitor Vercel/Render auto-deployment (2-3 min rollout)
4. Test Mural media playback (video, audio, embeds)
5. Verify OpenClaw endpoint accessible after backend rebuild

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
