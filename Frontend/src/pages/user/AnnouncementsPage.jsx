import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    API.get('/announcements/my').then(({ data }) => setAnnouncements(data));
  }, []);

  return (
    <DashboardLayout title="Announcements" subtitle="Latest notices from the academy and your batch.">
      <div className="space-y-4">
        {announcements.length ? announcements.map((item) => (
          <article key={item._id} className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl font-black">{item.title}</h3>
              <span className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{item.message}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-300">{item.batch?.name || 'All Players'}</p>
          </article>
        )) : <p className="text-sm text-slate-400">No announcements published yet.</p>}
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementsPage;
