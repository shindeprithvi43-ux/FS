import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    API.get('/sessions/my').then(({ data }) => setSessions(data));
  }, []);

  return (
    <DashboardLayout title="Training Sessions" subtitle="See upcoming batch sessions and prepare ahead of time.">
      <div className="grid gap-4 lg:grid-cols-2">
        {sessions.length ? sessions.map((session) => (
          <article key={session._id} className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{session.type}</p>
            <h3 className="mt-3 text-2xl font-black">{session.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{new Date(session.date).toLocaleString()}</p>
            <p className="mt-2 text-sm text-slate-400">Batch: {session.batch?.name || 'Assigned batch'}</p>
            {session.notes && <p className="mt-4 text-sm leading-6 text-slate-400">{session.notes}</p>}
          </article>
        )) : <p className="text-sm text-slate-400">No training sessions scheduled yet.</p>}
      </div>
    </DashboardLayout>
  );
};

export default SessionsPage;
