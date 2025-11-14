import Link from 'next/link';
import { ArrowRight, Camera, FileUp, Sparkles } from 'lucide-react';

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
      'Your scores live securely on your device using IndexedDB.',
    icon: Camera,
  },
];

const HomePage = () => (
  <main className="flex flex-1 flex-col min-h-screen">
    <section className="relative isolate overflow-hidden bg-brand-100 px-6 py-24 text-brand-500 md:px-12 min-h-screen flex items-center">
      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 md:flex-row w-full">
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
  </main>
);

export default HomePage;
