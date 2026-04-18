import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const emptyBatchForm = { name: '', timing: '', category: 'Mixed', maxPlayers: 20, description: '' };

const AdminBatchesPage = () => {
  const [batches, setBatches] = useState([]);
  const [batchForm, setBatchForm] = useState(emptyBatchForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [playerCounts, setPlayerCounts] = useState({});

  const loadData = async () => {
    try {
      const [batchRes, playerRes] = await Promise.all([
        API.get('/admin/batches'),
        API.get('/admin/players')
      ]);
      setBatches(batchRes.data);
      const counts = {};
      playerRes.data.forEach(p => {
        const bid = p.batch?._id || p.batch;
        if (bid) counts[bid] = (counts[bid] || 0) + 1;
      });
      setPlayerCounts(counts);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setBatchForm(emptyBatchForm);
    setEditingId(null);
    setShowForm(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/batches/${editingId}`, { ...batchForm, maxPlayers: Number(batchForm.maxPlayers) });
        toast.success('Batch updated successfully');
      } else {
        await API.post('/admin/batches', { ...batchForm, maxPlayers: Number(batchForm.maxPlayers) });
        toast.success('Batch created successfully');
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save batch');
    }
  };

  const onEdit = (batch) => {
    setBatchForm({
      name: batch.name,
      timing: batch.timing,
      category: batch.category,
      maxPlayers: batch.maxPlayers,
      description: batch.description || ''
    });
    setEditingId(batch._id);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await API.delete(`/admin/batches/${id}`);
      toast.success('Batch deleted');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete batch');
    }
  };

  const inputClass = 'w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors';
  const sectionClass = 'rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6';

  return (
    <DashboardLayout title="Manage Batches" subtitle="Create, edit, and organize training batches.">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="text-slate-400 text-sm">{batches.length} active batch{batches.length !== 1 ? 'es' : ''}</p>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Create Batch'}
        </button>
      </div>

      {showForm && (
        <section className={`${sectionClass} mb-5`}>
          <h2 className="text-xl font-black mb-5">{editingId ? 'Edit Batch' : 'Create New Batch'}</h2>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} placeholder="Batch name *" required value={batchForm.name} onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })} />
            <input className={inputClass} placeholder="Timing (e.g. 6:00 AM - 8:00 AM) *" required value={batchForm.timing} onChange={(e) => setBatchForm({ ...batchForm, timing: e.target.value })} />
            <select className={inputClass} value={batchForm.category} onChange={(e) => setBatchForm({ ...batchForm, category: e.target.value })}>
              <option>Mixed</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
            <input className={inputClass} type="number" placeholder="Max players" min="1" value={batchForm.maxPlayers} onChange={(e) => setBatchForm({ ...batchForm, maxPlayers: e.target.value })} />
            <textarea className={`${inputClass} md:col-span-2 min-h-[90px]`} placeholder="Description (optional)" value={batchForm.description} onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })} />
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer">
                {editingId ? 'Update Batch' : 'Create Batch'}
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
        <h2 className="text-xl font-black mb-5">Active Batches</h2>
        {batches.length === 0 ? (
          <p className="text-sm text-slate-400">No batches created yet. Click "Create Batch" to get started.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {batches.map((batch) => (
              <article key={batch._id} className="rounded-2xl bg-[#08111f] p-5 border border-[#17304a]/50 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{batch.name}</p>
                    <p className="mt-1 text-sm text-emerald-300">{batch.timing}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(batch)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" title="Edit">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => onDelete(batch._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">{batch.category}</span>
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">{playerCounts[batch._id] || 0}/{batch.maxPlayers} players</span>
                </div>
                {batch.description && <p className="mt-3 text-sm text-slate-400 leading-6">{batch.description}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminBatchesPage;
