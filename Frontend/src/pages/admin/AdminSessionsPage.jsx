import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const emptyForm = {
  title: '',
  date: new Date().toISOString().slice(0, 16),
  type: 'Batting',
  batch: '',
  notes: ''
};

const AdminSessionsPage = () => {
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      const [batchRes, sessionRes] = await Promise.all([
        API.get('/admin/batches'),
        API.get('/admin/sessions')
      ]);
      setBatches(batchRes.data);
      setSessions(sessionRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (batches.length && !form.batch && !editingId) {
      setForm(f => ({ ...f, batch: batches[0]._id }));
    }
  }, [batches, form.batch, editingId]);

  const resetForm = () => {
    setForm({ ...emptyForm, batch: batches[0]?._id || '' });
    setEditingId(null);
    setShowForm(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/sessions/${editingId}`, form);
        toast.success('Session updated successfully');
      } else {
        await API.post('/admin/sessions', form);
        toast.success('Session created successfully');
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save session');
    }
  };

  const onEdit = (session) => {
    setForm({
      title: session.title,
      date: new Date(session.date).toISOString().slice(0, 16),
      type: session.type,
      batch: session.batch?._id || '',
      notes: session.notes || ''
    });
    setEditingId(session._id);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await API.delete(`/admin/sessions/${id}`);
      toast.success('Session deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const typeColors = {
    Batting: 'bg-emerald-500/10 text-emerald-300',
    Bowling: 'bg-cyan-500/10 text-cyan-300',
    Fitness: 'bg-amber-500/10 text-amber-300'
  };

  const inputClass = 'w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors';
  const sectionClass = 'rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6';

  return (
    <DashboardLayout title="Training Sessions" subtitle="Schedule and manage training sessions for each batch.">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="text-slate-400 text-sm">{sessions.length} session{sessions.length !== 1 ? 's' : ''} scheduled</p>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Create Session'}
        </button>
      </div>

      {showForm && (
        <section className={`${sectionClass} mb-5`}>
          <h2 className="text-xl font-black mb-5">{editingId ? 'Edit Session' : 'Create New Session'}</h2>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} placeholder="Session title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className={inputClass} type="datetime-local" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Batting</option><option>Bowling</option><option>Fitness</option>
            </select>
            <select className={inputClass} value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <textarea className={`${inputClass} md:col-span-2 min-h-[90px]`} placeholder="Preparation notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer">
                {editingId ? 'Update Session' : 'Create Session'}
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
        <h2 className="text-xl font-black mb-5">Scheduled Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400">No sessions scheduled yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <article key={session._id} className="rounded-2xl bg-[#08111f] p-5 border border-[#17304a]/50 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${typeColors[session.type] || 'bg-slate-500/10 text-slate-300'}`}>{session.type}</span>
                    <h3 className="mt-2 font-bold text-white">{session.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(session)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" title="Edit">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => onDelete(session._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-300">{new Date(session.date).toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-400">Batch: {session.batch?.name || 'Unknown'}</p>
                {session.notes && <p className="mt-3 text-sm text-slate-500 leading-6">{session.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminSessionsPage;
