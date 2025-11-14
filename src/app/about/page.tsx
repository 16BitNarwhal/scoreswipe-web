const milestones = [
  {
    title: 'MVP launch',
    description: 'Hands-free page turning with local score library and onboarding.',
    status: 'In progress',
  },
  {
    title: 'Cloud sync',
    description: 'Optional Supabase integration for multi-device access.',
    status: 'Planned',
  },
  {
    title: 'Collaborative set lists',
    description: 'Share playlists and annotations with your ensemble.',
    status: 'Exploring',
  },
];

const AboutPage = () => (
  <main className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16">
    <section className="space-y-6">
      <h1 className="text-4xl font-semibold text-brand-500">About ScoreSwipe Web</h1>
      <p className="text-brand-500/80">
        ScoreSwipe Web adapts our gesture-driven sheet music experience for the browser. It blends
        computer vision, responsive design, and offline-friendly storage so performers can rehearse
        anywhere without turning a page by hand.
      </p>
      <p className="text-brand-500/80">
        This rewrite is built with Next.js, React, Zustand, and Dexie. We leverage MediaPipe for
        on-device face tracking to detect head tilts, and pdfjs for rendering. No camera footage
        leaves your device.
      </p>
    </section>
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-brand-500">Roadmap</h2>
      <ul className="grid gap-4 md:grid-cols-3">
        {milestones.map((milestone) => (
          <li key={milestone.title} className="rounded-3xl border border-brand-100 bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-brand-500">{milestone.title}</h3>
            <p className="mt-2 text-sm text-brand-400">{milestone.description}</p>
            <span className="mt-4 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-400">
              {milestone.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  </main>
);

export default AboutPage;
