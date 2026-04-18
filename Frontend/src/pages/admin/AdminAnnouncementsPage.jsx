import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const emptyForm = { title: '', message: '', batch: '' };

const AdminAnnouncementsPage = () => {
  const [batches, setBatches] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      const [batchRes, annRes] = await Promise.all([
        API.get('/admin/batches'),
        API.get('/admin/announcements')
      ]);
      setBatches(batchRes.data);
      setAnnouncements(annRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, batch: form.batch || null };
      if (editingId) {
        await API.put(`/admin/announcements/${editingId}`, payload);
        toast.success('Announcement updated');
      } else {
        await API.post('/admin/announcements', payload);
        toast.success('Announcement published');
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const onEdit = (item) => {
    setForm({
      title: item.title,
      message: item.message,
      batch: item.batch?._id || ''
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await API.delete(`/admin/announcements/${id}`);
      toast.success('Announcement deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const inputClass = 'w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors';
  const sectionClass = 'rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6';

  return (
    <DashboardLayout title="Announcements" subtitle="Publish notices for all players or specific batches.">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="text-slate-400 text-sm">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {showForm && (
        <section className={`${sectionClass} mb-5`}>
          <h2 className="text-xl font-black mb-5">{editingId ? 'Edit Announcement' : 'Publish Announcement'}</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <input className={inputClass} placeholder="Announcement title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className={inputClass} value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
              <option value="">All Players</option>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <textarea className={`${inputClass} min-h-[120px]`} placeholder="Message *" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer">
                {editingId ? 'Update Announcement' : 'Publish Notice'}
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
        <h2 className="text-xl font-black mb-5">Published Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-400">No announcements published yet.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <article key={item._id} className="rounded-2xl bg-[#08111f] p-5 border border-[#17304a]/50 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-lg">{item.title}</h3>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                        {item.batch?.name || 'All Players'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEdit(item)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" title="Edit">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => onDelete(item._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminAnnouncementsPage;
