import { useState } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, title, subtitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:ml-[280px] min-h-screen">
        <header className="sticky top-0 z-30 border-b border-[#17304a] bg-[#08111f]/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              {title && <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>}
              {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#1b3a5c] bg-[#0d1b2a] text-slate-200 lg:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
