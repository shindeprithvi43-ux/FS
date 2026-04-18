import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const AdminDashboard = () => {
  const [overview, setOverview] = useState({ batches: [], players: [], sessions: [], announcements: [], matches: [] });
  const [analytics, setAnalytics] = useState(null);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [overviewRes, analyticsRes] = await Promise.all([
          API.get('/admin/overview'),
          API.get('/admin/analytics')
        ]);
        setOverview(overviewRes.data);
        setAnalytics(analyticsRes.data);
        setLoadError('');
      } catch (error) {
        setLoadError(error.response?.data?.message || 'Could not load admin dashboard data.');
      }
    };
    loadDashboard();
  }, []);

  const sectionClass = 'rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6';

  const quickActions = [
    { label: 'Manage Players', icon: 'group', path: '/admin/players', count: overview.players.length, color: 'emerald' },
    { label: 'Manage Batches', icon: 'view_list', path: '/admin/batches', count: overview.batches.length, color: 'cyan' },
    { label: 'Mark Attendance', icon: 'calendar_month', path: '/admin/attendance', color: 'amber' },
    { label: 'Track Performance', icon: 'analytics', path: '/admin/performance', color: 'purple' },
    { label: 'Training Sessions', icon: 'sports', path: '/admin/sessions', count: overview.sessions.length, color: 'rose' },
    { label: 'Announcements', icon: 'campaign', path: '/admin/announcements', count: overview.announcements.length, color: 'sky' },
    { label: 'Matches', icon: 'emoji_events', path: '/admin/matches', count: overview.matches.length, color: 'orange' },
  ];

  const colorMap = {
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 hover:border-rose-500/40',
    sky: 'from-sky-500/20 to-sky-600/5 border-sky-500/20 hover:border-sky-500/40',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40',
  };

  const iconColorMap = {
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    rose: 'text-rose-400',
    sky: 'text-sky-400',
    orange: 'text-orange-400',
  };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Overview of academy performance, quick actions, and top performers.">
      {loadError && (
        <div className="mb-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{loadError}</div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className={sectionClass}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Players</p>
          <p className="mt-3 text-4xl font-black">{analytics?.totalPlayers || 0}</p>
        </div>
        <div className={sectionClass}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Attendance Rate</p>
          <p className="mt-3 text-4xl font-black">{analytics?.attendanceRate || 0}%</p>
        </div>
        <div className={sectionClass}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Monthly Revenue</p>
          <p className="mt-3 text-4xl font-black">₹{analytics?.revenueStats?.estimatedMonthlyRevenue || 0}</p>
        </div>
        <div className={sectionClass}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active Batches</p>
          <p className="mt-3 text-4xl font-black">{analytics?.revenueStats?.activeBatches || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mt-5">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`rounded-2xl bg-gradient-to-br ${colorMap[action.color]} border p-5 text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-2xl ${iconColorMap[action.color]}`}>{action.icon}</span>
                <div>
                  <p className="font-bold text-white text-sm">{action.label}</p>
                  {action.count !== undefined && (
                    <p className="text-xs text-slate-400 mt-0.5">{action.count} total</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Best Performers + Recent Activity */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className={sectionClass}>
          <h2 className="text-xl font-black mb-5">Best Performers</h2>
          <div className="space-y-3">
            {analytics?.bestPerformers?.length ? analytics.bestPerformers.map((item, index) => (
              <div key={item.playerId} className="rounded-2xl bg-[#08111f] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 font-bold text-sm">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="text-emerald-300">{item.runs}r</span> · <span className="text-cyan-300">{item.wickets}w</span> · <span className="text-purple-300">{item.catches}c</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Score</p>
                  <p className="font-bold text-amber-400">{item.score}</p>
                </div>
              </div>
            )) : <p className="text-sm text-slate-400">No performer data yet. Add performance records to see rankings.</p>}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-black mb-5">Recent Activity</h2>
          <div className="space-y-3">
            {overview.announcements.slice(0, 3).map((item) => (
              <div key={item._id} className="rounded-2xl bg-[#08111f] p-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-400 text-lg">campaign</span>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-400 line-clamp-2">{item.message}</p>
                <p className="mt-1 text-xs text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {overview.matches.slice(0, 2).map((match) => (
              <div key={match._id} className="rounded-2xl bg-[#08111f] p-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-400 text-lg">emoji_events</span>
                  <p className="font-semibold text-white text-sm">{match.title} vs {match.opponent}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{new Date(match.date).toLocaleDateString()} · {match.selectedPlayers?.length || 0} players</p>
              </div>
            ))}
            {overview.announcements.length === 0 && overview.matches.length === 0 && (
              <p className="text-sm text-slate-400">No recent activity yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Players Overview */}
      <section className={`${sectionClass} mt-5`}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-black">Players Overview</h2>
          <button
            onClick={() => navigate('/admin/players')}
            className="rounded-xl border border-[#1b3a5c] px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            View All →
          </button>
        </div>
        {overview.players.length === 0 ? (
          <p className="text-sm text-slate-400">No players added yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {overview.players.slice(0, 8).map((player) => (
              <article key={player._id} className="rounded-2xl bg-[#08111f] p-4 border border-[#17304a]/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <span className="text-emerald-400 font-bold text-xs">{player.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{player.name}</p>
                    <p className="text-xs text-slate-500">{player.loginId}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">{player.skillLevel} · {player.batch?.name || 'No batch'}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
