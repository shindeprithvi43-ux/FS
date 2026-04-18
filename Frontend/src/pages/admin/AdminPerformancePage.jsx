import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const emptyForm = {
  userId: '',
  date: new Date().toISOString().slice(0, 10),
  sessionType: 'Practice',
  battingRuns: 0,
  battingBalls: 0,
  bowlingOvers: 0,
  bowlingWickets: 0,
  bowlingEconomy: 0,
  fieldingCatches: 0,
  fieldingRunOuts: 0,
  strengths: '',
  weaknesses: '',
  remarks: ''
};

const AdminPerformancePage = () => {
  const [players, setPlayers] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      const [playerRes, perfRes] = await Promise.all([
        API.get('/admin/players'),
        API.get('/admin/performance')
      ]);
      setPlayers(playerRes.data);
      setRecords(perfRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (players.length && !form.userId && !editingId) {
      setForm(f => ({ ...f, userId: players[0]._id }));
    }
  }, [players, form.userId, editingId]);

  const resetForm = () => {
    setForm({ ...emptyForm, userId: players[0]?._id || '' });
    setEditingId(null);
    setShowForm(false);
  };

  const buildPayload = () => ({
    userId: form.userId,
    date: form.date,
    sessionType: form.sessionType,
    batting: {
      runs: Number(form.battingRuns),
      balls: Number(form.battingBalls),
      strikeRate: Number(form.battingBalls) > 0 ? Number(((Number(form.battingRuns) / Number(form.battingBalls)) * 100).toFixed(2)) : 0
    },
    bowling: {
      overs: Number(form.bowlingOvers),
      wickets: Number(form.bowlingWickets),
      economy: Number(form.bowlingEconomy)
    },
    fielding: {
      catches: Number(form.fieldingCatches),
      runOuts: Number(form.fieldingRunOuts)
    },
    strengths: form.strengths,
    weaknesses: form.weaknesses,
    remarks: form.remarks
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/performance/${editingId}`, buildPayload());
        toast.success('Performance record updated');
      } else {
        await API.post('/admin/performance', buildPayload());
        toast.success('Performance record added');
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save performance record');
    }
  };

  const onEdit = (record) => {
    setForm({
      userId: record.userId?._id || record.userId,
      date: new Date(record.date).toISOString().slice(0, 10),
      sessionType: record.sessionType || 'Practice',
      battingRuns: record.batting?.runs || 0,
      battingBalls: record.batting?.balls || 0,
      bowlingOvers: record.bowling?.overs || 0,
      bowlingWickets: record.bowling?.wickets || 0,
      bowlingEconomy: record.bowling?.economy || 0,
      fieldingCatches: record.fielding?.catches || 0,
      fieldingRunOuts: record.fielding?.runOuts || 0,
      strengths: record.strengths || '',
      weaknesses: record.weaknesses || '',
      remarks: record.remarks || ''
    });
    setEditingId(record._id);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this performance record?')) return;
    try {
      await API.delete(`/admin/performance/${id}`);
      toast.success('Record deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const inputClass = 'w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors';
  const sectionClass = 'rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6';

  return (
    <DashboardLayout title="Performance Tracking" subtitle="Record and manage player performance data.">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="text-slate-400 text-sm">{records.length} performance record{records.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Add Record'}
        </button>
      </div>

      {showForm && (
        <section className={`${sectionClass} mb-5`}>
          <h2 className="text-xl font-black mb-5">{editingId ? 'Edit Performance' : 'Add Performance Record'}</h2>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Player</label>
              <select className={inputClass} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                {players.map(p => <option key={p._id} value={p._id}>{p.name} ({p.loginId})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Date</label>
              <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Session Type</label>
              <select className={inputClass} value={form.sessionType} onChange={(e) => setForm({ ...form, sessionType: e.target.value })}>
                <option>Practice</option><option>Match</option><option>Batting</option><option>Bowling</option><option>Fitness</option><option>Assessment</option>
              </select>
            </div>
            <div></div>

            <p className="md:col-span-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300 mt-2">Batting</p>
            <input className={inputClass} type="number" placeholder="Runs" min="0" value={form.battingRuns} onChange={(e) => setForm({ ...form, battingRuns: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Balls" min="0" value={form.battingBalls} onChange={(e) => setForm({ ...form, battingBalls: e.target.value })} />

            <p className="md:col-span-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mt-2">Bowling</p>
            <input className={inputClass} type="number" step="0.1" placeholder="Overs" min="0" value={form.bowlingOvers} onChange={(e) => setForm({ ...form, bowlingOvers: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Wickets" min="0" value={form.bowlingWickets} onChange={(e) => setForm({ ...form, bowlingWickets: e.target.value })} />
            <input className={inputClass} type="number" step="0.01" placeholder="Economy" min="0" value={form.bowlingEconomy} onChange={(e) => setForm({ ...form, bowlingEconomy: e.target.value })} />
            <div></div>

            <p className="md:col-span-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mt-2">Fielding</p>
            <input className={inputClass} type="number" placeholder="Catches" min="0" value={form.fieldingCatches} onChange={(e) => setForm({ ...form, fieldingCatches: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Run-outs" min="0" value={form.fieldingRunOuts} onChange={(e) => setForm({ ...form, fieldingRunOuts: e.target.value })} />

            <p className="md:col-span-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-300 mt-2">Coach Notes</p>
            <textarea className={`${inputClass} min-h-[80px]`} placeholder="Strengths" value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} />
            <textarea className={`${inputClass} min-h-[80px]`} placeholder="Weaknesses" value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} />
            <textarea className={`${inputClass} md:col-span-2 min-h-[80px]`} placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer">
                {editingId ? 'Update Record' : 'Add Record'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-2xl border border-[#1b3a5c] px-5 py-4 text-sm font-bold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className={sectionClass}>
        <h2 className="text-xl font-black mb-5">Performance Records</h2>
        {records.length === 0 ? (
          <p className="text-sm text-slate-400">No performance records yet.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {records.map((record) => (
              <article key={record._id} className="rounded-2xl bg-[#08111f] p-5 border border-[#17304a]/50 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{record.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{record.userId?.loginId} · {new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">{record.sessionType}</span>
                    <button onClick={() => onEdit(record)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" title="Edit">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => onDelete(record._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-[#0d1b2a] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Batting</p>
                    <p className="mt-1 text-slate-300">{record.batting?.runs || 0}r / {record.batting?.balls || 0}b</p>
                    <p className="text-xs text-slate-500">SR: {record.batting?.strikeRate || 0}</p>
                  </div>
                  <div className="rounded-xl bg-[#0d1b2a] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Bowling</p>
                    <p className="mt-1 text-slate-300">{record.bowling?.wickets || 0}w / {record.bowling?.overs || 0}ov</p>
                    <p className="text-xs text-slate-500">Eco: {record.bowling?.economy || 0}</p>
                  </div>
                  <div className="rounded-xl bg-[#0d1b2a] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Fielding</p>
                    <p className="mt-1 text-slate-300">{record.fielding?.catches || 0}c / {record.fielding?.runOuts || 0}ro</p>
                  </div>
                </div>
                {(record.strengths || record.weaknesses || record.remarks) && (
                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    {record.strengths && <p><span className="text-emerald-300 font-semibold">Strengths:</span> {record.strengths}</p>}
                    {record.weaknesses && <p><span className="text-amber-300 font-semibold">Weaknesses:</span> {record.weaknesses}</p>}
                    {record.remarks && <p><span className="text-cyan-300 font-semibold">Remarks:</span> {record.remarks}</p>}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminPerformancePage;
