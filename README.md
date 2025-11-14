# ScoreSwipe Web

A Next.js rewrite of ScoreSwipe that brings gesture-driven sheet music navigation to the browser. Upload PDFs, capture pages with your camera, organize scores in folders, and navigate hands-free using head tilt detection.

**Live at:** [scoreswipe.ericzhang.tech](https://scoreswipe.ericzhang.tech)

## Features

- 📚 **Library Management** - Organize scores in folders, mark favorites, search and filter
- 📄 **PDF Import** - Upload PDFs and automatically convert to navigable pages
- 📷 **Camera Capture** - Capture sheet music pages directly from your device camera
- 🖼️ **Image Upload** - Drag and drop images or select multiple files
- 👁️ **Gesture Controls** - Navigate pages hands-free using head tilt detection (MediaPipe)
- 📱 **Mobile-Friendly** - Responsive design optimized for mobile devices
- 💾 **Local-First** - All data stored locally using IndexedDB (no cloud required)
- 📤 **Export/Import** - Backup and restore your entire library

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

The static export will be generated in the `out` directory.

## Project Structure

```
scoreswipe-web/
├── .github/
│   └── workflows/      # GitHub Actions deployment workflow
├── public/             # Static assets, PWA manifest, CNAME
├── src/
│   ├── app/            # Next.js app routes (home, library, create, viewer)
│   ├── components/     # Reusable UI + feature components
│   ├── lib/            # Data access, PDF helpers, vision abstractions
│   ├── store/          # Zustand state containers
│   └── styles/         # Tailwind and global CSS
├── package.json        # Dependencies and scripts
├── next.config.mjs    # Next.js configuration (static export)
├── tailwind.config.ts # Tailwind theme aligned with mobile brand
└── tsconfig.json       # TypeScript configuration
```

## Technology Stack

- **Framework:** Next.js 14 (App Router) with static export
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Database:** IndexedDB via Dexie
- **PDF Processing:** pdfjs-dist
- **Computer Vision:** @mediapipe/tasks-vision
- **Icons:** Lucide React

## Deployment

This project is configured for deployment to GitHub Pages with a custom domain.

### Quick Setup

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Select "GitHub Actions" as the source

2. **Configure DNS:**
   - Add a CNAME record: `scoreswipe` → `<username>.github.io`
   - Or use A records pointing to GitHub Pages IPs

3. **Set Custom Domain:**
   - In repository Settings → Pages
   - Enter custom domain: `scoreswipe.ericzhang.tech`
   - Enable "Enforce HTTPS"

4. **Deploy:**
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Roadmap

- ✅ PDF rasterization with `pdfjs-dist`
- ✅ Camera capture with WebRTC
- ✅ Folder-based organization
- ✅ Drag and drop score management
- ✅ Mobile-responsive design
- 🔄 MediaPipe gesture detection integration
- 🔄 Offline caching service worker
- 🔄 PWA polish and install prompts
- 🔄 Cloud sync (optional Supabase integration)

## License

Private project - All rights reserved
