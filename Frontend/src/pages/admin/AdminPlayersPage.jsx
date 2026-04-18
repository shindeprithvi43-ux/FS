import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const emptyPlayerForm = {
  name: '',
  age: '',
  phone: '',
  email: '',
  password: '',
  guardianName: '',
  guardianContact: '',
  skillLevel: 'Beginner',
  batch: '',
  position: 'Batsman'
};

const AdminPlayersPage = () => {
  const [batches, setBatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerForm, setPlayerForm] = useState(emptyPlayerForm);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      const [batchRes, playerRes] = await Promise.all([
        API.get('/admin/batches'),
        API.get('/admin/players')
      ]);
      setBatches(batchRes.data);
      setPlayers(playerRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (batches.length && !playerForm.batch && !editingId) {
      setPlayerForm(f => ({ ...f, batch: batches[0]._id }));
    }
  }, [batches, playerForm.batch, editingId]);

  const resetForm = () => {
    setPlayerForm({ ...emptyPlayerForm, batch: batches[0]?._id || '' });
    setEditingId(null);
    setShowForm(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/players/${editingId}`, { ...playerForm, age: Number(playerForm.age) });
        toast.success('Player updated successfully');
      } else {
        const { data } = await API.post('/admin/players', { ...playerForm, age: Number(playerForm.age) });
        setCreatedCredentials(data.credentials);
        toast.success('Player added successfully');
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save player');
    }
  };

  const onEdit = (player) => {
    setPlayerForm({
      name: player.name,
      age: player.age,
      phone: player.phone,
      email: player.email || '',
      guardianName: player.guardianName || '',
      guardianContact: player.guardianContact || '',
      skillLevel: player.skillLevel,
      batch: player.batch?._id || '',
      position: player.position || 'Batsman'
    });
    setEditingId(player._id);
    setShowForm(true);
    setCreatedCredentials(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this player?')) return;
    try {
      await API.delete(`/admin/players/${id}`);
      toast.success('Player deactivated');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete player');
    }
  };

  const inputClass = 'w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors';
  const sectionClass = 'rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6';

  return (
    <DashboardLayout title="Manage Players" subtitle="Add, edit, and manage academy players.">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      {createdCredentials && (
        <div className="mb-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-emerald-200">
          <p className="font-bold text-emerald-300 mb-2">✅ New Player Credentials</p>
          Email: <span className="font-bold">{createdCredentials.email}</span><br />
          Password: <span className="font-bold">{createdCredentials.password}</span>
          <p className="mt-2 text-emerald-400/60 text-xs">Share these credentials with the player. They will use their email and this password to log in.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="text-slate-400 text-sm">{players.length} player{players.length !== 1 ? 's' : ''} registered</p>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Add Player'}
        </button>
      </div>

      {showForm && (
        <section className={`${sectionClass} mb-5`}>
          <h2 className="text-xl font-black mb-5">{editingId ? 'Edit Player' : 'Add New Player'}</h2>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} placeholder="Player name *" required value={playerForm.name} onChange={(e) => setPlayerForm(f => ({ ...f, name: e.target.value }))} />
            <input className={inputClass} placeholder="Age *" type="number" required min="4" value={playerForm.age} onChange={(e) => setPlayerForm(f => ({ ...f, age: e.target.value }))} />
            <input className={inputClass} placeholder="Email *" type="email" required value={playerForm.email} onChange={(e) => setPlayerForm(f => ({ ...f, email: e.target.value }))} />
            {!editingId && <input className={inputClass} placeholder="Password * (min 6 chars)" type="password" required minLength="6" value={playerForm.password} onChange={(e) => setPlayerForm(f => ({ ...f, password: e.target.value }))} />}
            <input className={inputClass} placeholder="Phone *" required value={playerForm.phone} onChange={(e) => setPlayerForm(f => ({ ...f, phone: e.target.value }))} />
            <select className={inputClass} value={playerForm.skillLevel} onChange={(e) => setPlayerForm(f => ({ ...f, skillLevel: e.target.value }))}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
            <select className={inputClass} value={playerForm.position} onChange={(e) => setPlayerForm(f => ({ ...f, position: e.target.value }))}>
              <option>Batsman</option><option>Bowler</option><option>All-Rounder</option><option>Wicketkeeper</option>
            </select>
            <select className={inputClass} value={playerForm.batch} onChange={(e) => setPlayerForm(f => ({ ...f, batch: e.target.value }))}>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <input className={inputClass} placeholder="Guardian name" value={playerForm.guardianName} onChange={(e) => setPlayerForm(f => ({ ...f, guardianName: e.target.value }))} />
            <input className={`${inputClass} md:col-span-2`} placeholder="Guardian contact" value={playerForm.guardianContact} onChange={(e) => setPlayerForm(f => ({ ...f, guardianContact: e.target.value }))} />
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer">
                {editingId ? 'Update Player' : 'Add Player'}
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
        <h2 className="text-xl font-black mb-5">Players List</h2>
        {players.length === 0 ? (
          <p className="text-sm text-slate-400">No players added yet. Click "Add Player" to get started.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <article key={player._id} className="rounded-2xl bg-[#08111f] p-5 border border-[#17304a]/50 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <span className="text-emerald-400 font-bold text-sm">{player.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{player.name}</p>
                      <p className="text-xs text-slate-500">{player.loginId}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(player)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" title="Edit">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => onDelete(player._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">Email:</span> {player.email || 'N/A'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Batch:</span> {player.batch?.name || 'Unassigned'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Skill:</span> {player.skillLevel} · <span className="text-slate-500">Pos:</span> {player.position}</p>
                  <p className="text-slate-400">{player.phone}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminPlayersPage;
