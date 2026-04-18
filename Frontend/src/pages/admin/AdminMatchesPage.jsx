import { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const emptyForm = {
  title: '',
  opponent: '',
  tournament: '',
  format: '',
  date: new Date().toISOString().slice(0, 16),
  selectedPlayers: []
};

const AdminMatchesPage = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [matchStats, setMatchStats] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      const [playerRes, matchRes] = await Promise.all([
        API.get('/admin/players'),
        API.get('/admin/matches')
      ]);
      setPlayers(playerRes.data);
      setMatches(matchRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { loadData(); }, []);

  const selectedPlayersList = useMemo(
    () => players.filter(p => form.selectedPlayers.includes(p._id)),
    [players, form.selectedPlayers]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setMatchStats({});
    setEditingId(null);
    setShowForm(false);
  };

  const togglePlayer = (playerId) => {
    setForm(f => ({
      ...f,
      selectedPlayers: f.selectedPlayers.includes(playerId)
        ? f.selectedPlayers.filter(id => id !== playerId)
        : [...f.selectedPlayers, playerId]
    }));
    setMatchStats(current => ({
      ...current,
      [playerId]: current[playerId] || {
        batting: { runs: 0, balls: 0, strikeRate: 0 },
        bowling: { overs: 0, wickets: 0, economy: 0 },
        fielding: { catches: 0, runOuts: 0 }
      }
    }));
  };

  const updateStat = (playerId, section, field, value) => {
    setMatchStats(current => {
      const next = {
        ...current,
        [playerId]: {
          ...(current[playerId] || {
            batting: { runs: 0, balls: 0, strikeRate: 0 },
            bowling: { overs: 0, wickets: 0, economy: 0 },
            fielding: { catches: 0, runOuts: 0 }
          }),
          [section]: {
            ...(current[playerId]?.[section] || {}),
            [field]: Number(value)
          }
        }
      };
      if (section === 'batting') {
        const b = next[playerId].batting;
        b.strikeRate = b.balls > 0 ? Number(((b.runs / b.balls) * 100).toFixed(2)) : 0;
      }
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        playerStats: form.selectedPlayers.map(pid => ({ player: pid, ...matchStats[pid] }))
      };
      if (editingId) {
        await API.put(`/admin/matches/${editingId}`, payload);
        toast.success('Match updated');
      } else {
        await API.post('/admin/matches', payload);
        toast.success('Match saved');
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save match');
    }
  };

  const onEdit = (match) => {
    const playerIds = match.selectedPlayers?.map(p => p._id || p) || [];
    setForm({
      title: match.title,
      opponent: match.opponent,
      tournament: match.tournament || '',
      format: match.format || '',
      date: new Date(match.date).toISOString().slice(0, 16),
      selectedPlayers: playerIds
    });
    const stats = {};
    (match.playerStats || []).forEach(ps => {
      const pid = ps.player?._id || ps.player;
      stats[pid] = {
        batting: ps.batting || { runs: 0, balls: 0, strikeRate: 0 },
        bowling: ps.bowling || { overs: 0, wickets: 0, economy: 0 },
        fielding: ps.fielding || { catches: 0, runOuts: 0 }
      };
    });
    setMatchStats(stats);
    setEditingId(match._id);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this match?')) return;
    try {
      await API.delete(`/admin/matches/${id}`);
      toast.success('Match deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete match');
    }
  };

  const inputClass = 'w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors';
  const sectionClass = 'rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6';

  return (
    <DashboardLayout title="Matches & Tournaments" subtitle="Create matches, select players, and record match statistics.">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="text-slate-400 text-sm">{matches.length} match{matches.length !== 1 ? 'es' : ''} recorded</p>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Create Match'}
        </button>
      </div>

      {showForm && (
        <section className={`${sectionClass} mb-5`}>
          <h2 className="text-xl font-black mb-5">{editingId ? 'Edit Match' : 'Create New Match'}</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClass} placeholder="Match title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className={inputClass} placeholder="Opponent *" required value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
              <input className={inputClass} placeholder="Tournament (optional)" value={form.tournament} onChange={(e) => setForm({ ...form, tournament: e.target.value })} />
              <input className={inputClass} placeholder="Format (optional)" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} />
              <input className={inputClass} type="datetime-local" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>

            <div className="rounded-2xl bg-[#08111f] p-5 border border-[#17304a]/50">
              <p className="text-sm font-bold text-white mb-3">Select Players ({form.selectedPlayers.length} selected)</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {players.map(p => (
                  <label key={p._id} className={`flex items-center gap-3 rounded-xl border p-3 text-sm cursor-pointer transition-all ${form.selectedPlayers.includes(p._id) ? 'border-emerald-500/40 bg-emerald-500/5 text-white' : 'border-[#1b3a5c] text-slate-400 hover:border-slate-500'}`}>
                    <input type="checkbox" checked={form.selectedPlayers.includes(p._id)} onChange={() => togglePlayer(p._id)} className="accent-emerald-500" />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedPlayersList.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Player Statistics</p>
                {selectedPlayersList.map(player => (
                  <div key={player._id} className="rounded-2xl bg-[#08111f] p-4 border border-[#17304a]/50">
                    <p className="font-semibold text-white text-sm mb-3">{player.name} <span className="text-slate-500 font-normal">({player.loginId})</span></p>
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
                      <input className={inputClass} type="number" placeholder="Runs" min="0" value={matchStats[player._id]?.batting?.runs || 0} onChange={(e) => updateStat(player._id, 'batting', 'runs', e.target.value)} />
                      <input className={inputClass} type="number" placeholder="Balls" min="0" value={matchStats[player._id]?.batting?.balls || 0} onChange={(e) => updateStat(player._id, 'batting', 'balls', e.target.value)} />
                      <input className={inputClass} type="number" step="0.1" placeholder="Overs" min="0" value={matchStats[player._id]?.bowling?.overs || 0} onChange={(e) => updateStat(player._id, 'bowling', 'overs', e.target.value)} />
                      <input className={inputClass} type="number" placeholder="Wickets" min="0" value={matchStats[player._id]?.bowling?.wickets || 0} onChange={(e) => updateStat(player._id, 'bowling', 'wickets', e.target.value)} />
                      <input className={inputClass} type="number" step="0.01" placeholder="Economy" min="0" value={matchStats[player._id]?.bowling?.economy || 0} onChange={(e) => updateStat(player._id, 'bowling', 'economy', e.target.value)} />
                      <input className={inputClass} type="number" placeholder="Catches" min="0" value={matchStats[player._id]?.fielding?.catches || 0} onChange={(e) => updateStat(player._id, 'fielding', 'catches', e.target.value)} />
                      <input className={inputClass} type="number" placeholder="Run-outs" min="0" value={matchStats[player._id]?.fielding?.runOuts || 0} onChange={(e) => updateStat(player._id, 'fielding', 'runOuts', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer">
                {editingId ? 'Update Match' : 'Save Match'}
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
        <h2 className="text-xl font-black mb-5">Match History</h2>
        {matches.length === 0 ? (
          <p className="text-sm text-slate-400">No matches recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <article key={match._id} className="rounded-2xl bg-[#08111f] p-5 border border-[#17304a]/50 hover:border-emerald-500/20 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {match.tournament && <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">{match.tournament}</span>}
                      {match.format && <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">{match.format}</span>}
                    </div>
                    <h3 className="mt-2 font-bold text-white text-lg">{match.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">vs {match.opponent}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(match.date).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEdit(match)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" title="Edit">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => onDelete(match._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-slate-500">{match.selectedPlayers?.length || 0} players selected</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminMatchesPage;
