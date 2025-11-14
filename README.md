# ScoreSwipe Web

A Next.js rewrite of ScoreSwipe that brings gesture-driven sheet music navigation to the browser.

## Getting started

```bash
npm install
npm run dev
```

> The initial scaffolding was created manually due to environment restrictions. Run the commands above
> once dependencies are available on your machine.

## Project structure

```
scoreswipe-web/
├── public/             # Static assets, PWA manifest
├── src/
│   ├── app/            # Next.js app routes (home, library, create, viewer, settings)
│   ├── components/     # Reusable UI + feature components
│   ├── lib/            # Data access, PDF helpers, vision abstractions
│   ├── store/          # Zustand state containers
│   └── styles/         # Tailwind and global CSS
├── package.json        # Dependencies and scripts
├── tailwind.config.ts  # Tailwind theme aligned with mobile brand
└── tsconfig.json       # TypeScript configuration
```

## Highlights

- **Library management** powered by IndexedDB via Dexie, with export/import helpers.
- **Creation workflow** supporting PDFs, image uploads, and TODO hooks for camera capture and PDF rasterization.
- **Viewer experience** with gesture overlay scaffolding, manual controls, and future-ready MediaPipe integration via `TiltDetector`.
- **Settings** align with the original Flutter app—swipe mode, sensitivity, inversion, and viewer preferences.

## Roadmap

- Integrate `pdfjs-dist` to rasterize PDFs into page thumbnails.
- Wire `@mediapipe/tasks-vision` into `TiltDetector` with Web Worker acceleration.
- Add offline caching service worker and PWA polish.
- Implement Supabase-backed sync for authenticated users.
- Flesh out camera capture with WebRTC edge detection and cropping.

## Deployment

Once ready, deploy to Vercel and map `scoreswipe.ericzhang.tech` via DNS CNAME. Use environment variables and headers defined in `next.config.mjs` for security hardening.
