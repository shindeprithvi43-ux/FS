import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, label, value, subtext }) => (
  <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-5">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-black text-white">{value}</p>
        {subtext && <p className="mt-1 text-sm text-slate-400">{subtext}</p>}
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', guardianName: '', guardianContact: '' });

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get('/user/dashboard');
      setDashboardData(data);
      setProfileForm({
        name: data.user?.name || '',
        phone: data.user?.phone || '',
        guardianName: data.user?.guardianName || '',
        guardianContact: data.user?.guardianContact || ''
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard data.');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/user/profile', profileForm);
      toast.success('Profile updated successfully');
      setEditingProfile(false);
      await fetchDashboard();
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (error) {
    return (
      <DashboardLayout title="Player Dashboard" subtitle="Your attendance, training, announcements, and performance in one place.">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout title="Player Dashboard" subtitle="Loading your academy overview.">
        <div className="flex min-h-[50vh] items-center justify-center text-slate-400">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  const { user, attendance, latestPerformance, upcomingSessions, announcements, recentMatches } = dashboardData;

  const inputClass = 'w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors';

  return (
    <DashboardLayout title="Player Dashboard" subtitle="Your attendance, training, announcements, and performance in one place.">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="badge" label="Login ID" value={user?.loginId || '-'} subtext="Use this to sign in" />
        <StatCard icon="groups" label="Batch" value={user?.batch?.name || 'Unassigned'} subtext={user?.batch?.timing || 'No batch timing yet'} />
        <StatCard icon="calendar_month" label="Monthly Attendance" value={`${attendance?.monthly?.percentage || 0}%`} subtext={`${attendance?.monthly?.present || 0} present days`} />
        <StatCard icon="analytics" label="Latest Runs" value={latestPerformance?.batting?.runs ?? 0} subtext={`Wickets: ${latestPerformance?.bowling?.wickets ?? 0}`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Profile</p>
              <h2 className="mt-2 text-2xl font-black">{user?.name}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#08111f] px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Skill Level</p>
                <p className="mt-2 text-lg font-bold text-white">{user?.skillLevel || 'Beginner'}</p>
              </div>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                title="Edit Profile"
              >
                <span className="material-symbols-outlined">{editingProfile ? 'close' : 'edit'}</span>
              </button>
            </div>
          </div>

          {editingProfile ? (
            <form onSubmit={onUpdateProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Name</label>
                <input className={inputClass} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Phone</label>
                <input className={inputClass} value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Guardian Name</label>
                <input className={inputClass} value={profileForm.guardianName} onChange={(e) => setProfileForm({ ...profileForm, guardianName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Guardian Contact</label>
                <input className={inputClass} value={profileForm.guardianContact} onChange={(e) => setProfileForm({ ...profileForm, guardianContact: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer">
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingProfile(false)} className="rounded-2xl border border-[#1b3a5c] px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#08111f] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</p>
                <p className="mt-2 text-sm text-slate-300">{user?.phone || 'No phone added'}</p>
                <p className="mt-1 text-sm text-slate-400">{user?.email || 'No email added'}</p>
              </div>
              <div className="rounded-2xl bg-[#08111f] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Attendance Overview</p>
                <p className="mt-2 text-sm text-slate-300">Overall attendance: {attendance?.overall?.percentage || 0}%</p>
                <p className="mt-1 text-sm text-slate-400">Present {attendance?.overall?.present || 0} of {attendance?.overall?.total || 0} days</p>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-[#08111f] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold">Latest Performance Snapshot</h3>
              <span className="text-sm text-slate-500">{latestPerformance ? new Date(latestPerformance.date).toLocaleDateString() : 'No record yet'}</span>
            </div>
            {latestPerformance ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Batting</p>
                  <p className="mt-2 text-sm text-slate-300">Runs: {latestPerformance.batting?.runs || 0}</p>
                  <p className="text-sm text-slate-400">Balls: {latestPerformance.batting?.balls || 0}</p>
                  <p className="text-sm text-slate-400">SR: {latestPerformance.batting?.strikeRate || 0}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bowling</p>
                  <p className="mt-2 text-sm text-slate-300">Overs: {latestPerformance.bowling?.overs || 0}</p>
                  <p className="text-sm text-slate-400">Wickets: {latestPerformance.bowling?.wickets || 0}</p>
                  <p className="text-sm text-slate-400">Economy: {latestPerformance.bowling?.economy || 0}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fielding</p>
                  <p className="mt-2 text-sm text-slate-300">Catches: {latestPerformance.fielding?.catches || 0}</p>
                  <p className="text-sm text-slate-400">Run-outs: {latestPerformance.fielding?.runOuts || 0}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Your coach has not added any performance records yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
            <h3 className="text-lg font-bold">Upcoming Sessions</h3>
            <div className="mt-4 space-y-3">
              {upcomingSessions?.length ? upcomingSessions.map((session) => (
                <div key={session._id} className="rounded-2xl bg-[#08111f] p-4">
                  <p className="font-semibold text-white">{session.title}</p>
                  <p className="mt-1 text-sm text-emerald-300">{session.type}</p>
                  <p className="mt-1 text-sm text-slate-400">{new Date(session.date).toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No upcoming sessions yet.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
            <h3 className="text-lg font-bold">Latest Announcements</h3>
            <div className="mt-4 space-y-3">
              {announcements?.length ? announcements.map((item) => (
                <div key={item._id} className="rounded-2xl bg-[#08111f] p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.message}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No announcements yet.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
            <h3 className="text-lg font-bold">Recent Matches</h3>
            <div className="mt-4 space-y-3">
              {recentMatches?.length ? recentMatches.map((match) => (
                <div key={match._id} className="rounded-2xl bg-[#08111f] p-4">
                  <p className="font-semibold text-white">{match.title}</p>
                  <p className="mt-1 text-sm text-slate-400">vs {match.opponent}</p>
                  <p className="mt-1 text-sm text-slate-500">{new Date(match.date).toLocaleDateString()}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No match records yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
