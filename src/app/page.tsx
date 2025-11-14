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
  <main className="flex min-h-screen flex-1 flex-col">
    <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-brand-100 px-4 py-16 text-brand-500 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 text-center md:flex-row md:flex-row-reverse md:items-start md:gap-12 md:text-left">
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl font-bold tracking-tight text-brand-500 sm:text-5xl">
            ScoreSwipe Web
          </h1>
          <p className="mt-6 text-lg">
            Perform with confidence. Upload, organize, and flip through your sheet music hands-free
            right from the browser.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-start">
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
          <div className="rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur sm:p-8">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
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
