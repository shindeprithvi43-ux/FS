import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const PerformancePage = () => {
  const [performances, setPerformances] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [performanceResponse, statsResponse] = await Promise.all([
        API.get('/performance/my'),
        API.get('/performance/my/stats')
      ]);

      setPerformances(performanceResponse.data);
      setStats(statsResponse.data);
    };

    load();
  }, []);

  const chartData = performances.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    runs: item.batting?.runs || 0,
    wickets: item.bowling?.wickets || 0,
    catches: item.fielding?.catches || 0,
    strikeRate: item.batting?.strikeRate || 0
  }));

  return (
    <DashboardLayout title="Performance" subtitle="See your batting, bowling, and fielding progress over time.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-5"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Average Runs</p><p className="mt-3 text-3xl font-black">{stats?.batting?.avgRuns || 0}</p></div>
        <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-5"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Average Strike Rate</p><p className="mt-3 text-3xl font-black">{stats?.batting?.avgStrikeRate || 0}</p></div>
        <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-5"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Average Wickets</p><p className="mt-3 text-3xl font-black">{stats?.bowling?.avgWickets || 0}</p></div>
        <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-5"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fielding Impact</p><p className="mt-3 text-3xl font-black">{(stats?.fielding?.totalCatches || 0) + (stats?.fielding?.totalRunOuts || 0)}</p></div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
          <h3 className="text-lg font-bold">Runs and Wickets Trend</h3>
          <div className="mt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#17304a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="runs" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="wickets" stroke="#38bdf8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
          <h3 className="text-lg font-bold">Strike Rate and Catches</h3>
          <div className="mt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#17304a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="strikeRate" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="catches" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
        <h3 className="text-lg font-bold">Session History</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {performances.length ? performances.slice().reverse().map((record) => (
            <article key={record._id} className="rounded-2xl bg-[#08111f] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-white">{new Date(record.date).toLocaleDateString()}</p>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">{record.sessionType}</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-slate-300">
                <div>Runs: {record.batting?.runs || 0}<br />Balls: {record.batting?.balls || 0}<br />SR: {record.batting?.strikeRate || 0}</div>
                <div>Overs: {record.bowling?.overs || 0}<br />Wickets: {record.bowling?.wickets || 0}<br />Economy: {record.bowling?.economy || 0}</div>
                <div>Catches: {record.fielding?.catches || 0}<br />Run-outs: {record.fielding?.runOuts || 0}</div>
              </div>
              {(record.strengths || record.weaknesses || record.remarks) && (
                <div className="mt-4 space-y-2 text-sm text-slate-400">
                  {record.strengths && <p><span className="font-semibold text-emerald-300">Strengths:</span> {record.strengths}</p>}
                  {record.weaknesses && <p><span className="font-semibold text-amber-300">Weaknesses:</span> {record.weaknesses}</p>}
                  {record.remarks && <p><span className="font-semibold text-cyan-300">Remarks:</span> {record.remarks}</p>}
                </div>
              )}
            </article>
          )) : <p className="text-sm text-slate-400">No performance records available yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerformancePage;
