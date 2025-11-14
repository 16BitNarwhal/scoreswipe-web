import Link from 'next/link';
import { ArrowRight, Bot, Camera, FileUp, Sparkles } from 'lucide-react';

const marketingSections = [
  {
    title: 'Gesture-powered performance',
    description:
      'Turn pages without missing a beat. Head tilt detection keeps your focus on the music.',
    icon: Sparkles,
  },
  {
    title: 'Flexible score creation',
    description:
      'Import PDFs, drag in images, or capture pages from your device camera with instant previews.',
    icon: FileUp,
  },
  {
    title: 'Local-first library',
    description:
      'Your scores live securely on your device using IndexedDB with optional cloud sync.',
    icon: Camera,
  },
  {
    title: 'Guided onboarding',
    description:
      'Contextual walkthrough explains controls, calibration, and performance tips.',
    icon: Bot,
  },
];

const HomePage = () => (
  <main className="flex flex-1 flex-col">
    <section className="relative isolate overflow-hidden bg-brand-100 px-6 py-24 text-brand-500 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 md:flex-row">
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl font-bold tracking-tight text-brand-500 sm:text-5xl">
            ScoreSwipe Web
          </h1>
          <p className="mt-6 text-lg">
            Perform with confidence. Upload, organize, and flip through your sheet music hands-free
            right from the browser.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/library"
              className="inline-flex items-center justify-center rounded-full bg-brand-400 px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-brand-300"
            >
              Start
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="relative w-full md:w-1/2">
          <div className="rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {marketingSections.map((section) => (
                <div key={section.title} className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4">
                  <section.icon className="h-8 w-8 text-brand-400" />
                  <h3 className="text-lg font-semibold text-brand-500">{section.title}</h3>
                  <p className="text-brand-500/80">{section.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="bg-white px-6 py-24 text-brand-500 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-3xl font-semibold">Reimagining digital sheet music</h2>
          <p className="mt-4 text-brand-500/80">
            Every feature in ScoreSwipe Web is designed for practice rooms and stages alike. Start in
            the library to organize scores, create new arrangements, and dial in gesture preferences.
          </p>
        </div>
        <div className="md:col-span-2">
          <ol className="space-y-6">
            <li className="rounded-3xl border border-brand-100 bg-brand-50/80 p-6">
              <h3 className="text-xl font-semibold">1. Calibrate & configure</h3>
              <p className="mt-2 text-brand-500/80">
                The onboarding flow walks through camera setup, neutral pose calibration, and
                sensitivity adjustments before your first session.
              </p>
            </li>
            <li className="rounded-3xl border border-brand-100 bg-brand-50/80 p-6">
              <h3 className="text-xl font-semibold">2. Capture or upload scores</h3>
              <p className="mt-2 text-brand-500/80">
                Drag-and-drop PDFs, import photos, or snap pages from your device. Everything stores
                locally, and you can export backups any time.
              </p>
            </li>
            <li className="rounded-3xl border border-brand-100 bg-brand-50/80 p-6">
              <h3 className="text-xl font-semibold">3. Perform with hands-free control</h3>
              <p className="mt-2 text-brand-500/80">
                Head tilt detection flips pages instantaneously, with keyboard and on-screen buttons
                for redundancy when you need them.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </main>
);

export default HomePage;
