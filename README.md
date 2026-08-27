# KHATRA — AI Safety Training & Certification Platform
**SIH CY-1: AR-Based Vocational Training Simulator for Industrial Safety in Jharkhand's Mining, Steel & Mica Sectors**

## What's built

- **5 required safety domains** as AR-style camera-overlay training modules: Fire & Explosion Response, Gas Leak & Confined Space Protocol, Machinery Safety & Lockout-Tagout, Electrical Hazard Response, Dust & Respiratory Hazard Protection — plus a bonus Manual Handling module.
- **Hazard Scan** — live camera hazard detection via Gemini/OpenAI vision API.
- **Assessment engine** — per-domain pass threshold (70%), tracked across attempts.
- **QR-based certificate generation & verification** — `/certification` issues a certificate once all 5 domains are passed; `/verify/:certId` is a public verification page a QR scan opens.
- **Web admin compliance dashboard** — `/admin` shows aggregate certification stats, domain-wise averages, and CSV export.
- **Hindi + Santali localisation**, plus Bengali/Odia/Urdu — see the Language Coverage note below.
- **Offline functionality** — installable as a PWA with a service worker caching the full app shell (training, certificates, dashboard). Hazard Scan / AI coaching / chatbox still need connectivity since that inference runs on Gemini/OpenAI, not on-device.
- **AI site-assistant chatbox** — answers "how does this work" questions in-app.

## Language coverage note (read before demo)

Hindi is fully translated across all 6 modules — one of the two languages the brief requires.

**Santali is a low-resource language for AI translation.** Rather than risk inaccurate safety-critical instructions, this build:
- Has full architecture support for Santali (language selector, translation schema).
- Provides best-effort Santali (Ol Chiki script) for short, common UI labels only.
- Shows a clear on-screen notice when Santali is selected, and falls back to English for content not yet reviewed by a native speaker.

**Before your demo or any real deployment, get a native Santali speaker to review and correct `src/lib/i18n.js` and `src/lib/scenarioTranslations.js`.** This matters more for a safety app than almost anywhere else — get it verified, don't ship guessed translations for instructions workers will rely on.

Bengali/Odia/Urdu currently cover the original 3 modules; the 3 new domain modules will show in English in those languages until translated.

## Running it locally

```bash
npm install
npm run dev
```

Then get a free key at aistudio.google.com/apikey and paste it into Settings.

## Building the real Android APK

This app is wired to be wrapped as a native Android app via **Capacitor**. The web app itself already works as an installable PWA (offline, "Add to Home Screen"). To get an actual signed `.apk`:

**Prerequisites:** Android Studio installed, JDK 17+.

```bash
npm install
npm run build
npx cap add android
npx cap sync
npx cap open android
```

This opens the project in Android Studio. From there:
1. `Build -> Build Bundle(s) / APK(s) -> Build APK(s)`
2. The generated APK will be in `android/app/build/outputs/apk/debug/`
3. For a signed release APK, use `Build -> Generate Signed Bundle / APK`

Takes about 10 minutes once Android Studio finishes the first Gradle sync.

## Deploying the web/PWA version

```bash
npm run build
```

Drag the `dist/` folder to app.netlify.com/drop for an instant live URL.

## Architecture notes

- **No backend server** — all AI calls go directly from the browser/APK to Gemini or OpenAI using the user's own API key (stored locally only).
- **Admin dashboard is demo-mode**: reads certification data from local device storage only. Production would sync this via a backend (Firebase/Supabase) so an admin sees compliance data across every worker's device.
- **Certificates are locally verified**: the QR code encodes a link back into this app's `/verify/:id` route, checked against local storage. Real deployment should move issuance/verification server-side.

## Problem statement mapping

| Requirement | Status |
|---|---|
| Android APK, Android 10+, no headset | PWA + Capacitor scaffold provided; run `npx cap` steps above for the `.apk` |
| 5 safety domains as AR modules | All 5 implemented |
| Assessment engine | Implemented — 70% pass threshold per domain |
| QR certificate generation & verification | Implemented |
| Hindi + Santali localisation | Hindi complete; Santali architecture-ready, partial content (see note) |
| Offline functionality | Implemented via PWA service worker |
| Web admin compliance dashboard | Implemented (demo-mode, local-storage backed) |
| Demo video + public GitHub repo | Your action — push this code and record a walkthrough |
