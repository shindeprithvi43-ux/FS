import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-[#08111f]">
              <span className="material-symbols-outlined">sports_cricket</span>
            </div>
            <div>
              <h1 className="text-lg font-bold sm:text-xl">Krishna Cricket Academy</h1>
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Operations Suite</p>
            </div>
          </div>
          <Link to="/login" className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#08111f] transition hover:bg-emerald-400">
            Sign In
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(211,169,51,0.18),_transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_420px] lg:px-10 lg:py-24">
            <div className="relative">
              <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                Only two sides: admin and player
              </span>
              <h2 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                A practical cricket academy platform designed around real academy operations.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Admins add players manually, assign batches, manage attendance, capture performance, schedule sessions, publish announcements, and manage matches while players get a focused dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/login" className="rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-[#08111f] transition hover:bg-emerald-400">
                  Open Portal
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#1b3a5c] bg-[#0d1b2a] p-6 shadow-2xl shadow-black/20">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Core Modules</p>
              <div className="mt-6 space-y-4">
                {[
                  'Admin-controlled player onboarding with generated credentials',
                  'Batch-wise daily attendance and monthly attendance percentage',
                  'Performance tracking with batting, bowling, fielding, and remarks',
                  'Training sessions, announcements, matches, and analytics'
                ].map((feature) => (
                  <div key={feature} className="flex gap-3 rounded-2xl border border-[#1b3a5c] bg-[#08111f] p-4">
                    <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                    <p className="text-sm leading-6 text-slate-300">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Player Onboarding', 'Admins add players directly and share login ID and password.'],
              ['Attendance', 'Coaches mark present or absent by batch every day.'],
              ['Performance', 'Each session can record batting, bowling, fielding, strengths, and weaknesses.'],
              ['Analytics', 'Admin dashboards highlight participation trends and best performers.']
            ].map(([title, copy]) => (
              <article key={title} className="rounded-[26px] border border-[#1b3a5c] bg-[#0d1b2a] p-6">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
