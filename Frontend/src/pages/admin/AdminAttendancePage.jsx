import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const AdminAttendancePage = () => {
  const [batches, setBatches] = useState([]);
  const [attendanceBatchId, setAttendanceBatchId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendancePlayers, setAttendancePlayers] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const { data } = await API.get('/admin/batches');
        setBatches(data);
        if (data.length) setAttendanceBatchId(data[0]._id);
      } catch (error) {
        toast.error('Failed to load batches');
      }
    };
    loadBatches();
  }, []);

  useEffect(() => {
    if (!attendanceBatchId) return;
    const loadAttendance = async () => {
      try {
        const { data } = await API.get(`/admin/attendance/batch/${attendanceBatchId}?date=${attendanceDate}`);
        setAttendancePlayers(data.players);
        const statusMap = {};
        data.players.forEach((player) => {
          const existing = data.attendance.find((item) => String(item.userId?._id || item.userId) === String(player._id));
          statusMap[player._id] = {
            status: existing?.status || 'Present',
            notes: existing?.notes || ''
          };
        });
        setAttendanceMap(statusMap);
      } catch (error) {
        toast.error('Failed to load attendance data');
      }
    };
    loadAttendance();
  }, [attendanceBatchId, attendanceDate]);

  const onSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(([userId, value]) => ({ userId, ...value }));
      await API.post('/admin/attendance/mark', { batchId: attendanceBatchId, date: attendanceDate, records });
      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (newStatus) => {
    setAttendanceMap(prev => {
      const updated = {};
      attendancePlayers.forEach((player) => {
        updated[player._id] = { ...(prev[player._id] || {}), status: newStatus };
      });
      return updated;
    });
  };

  const presentCount = Object.values(attendanceMap).filter(v => v.status === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter(v => v.status === 'Absent').length;

  const inputClass = 'w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors';
  const sectionClass = 'rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6';

  return (
    <DashboardLayout title="Daily Attendance" subtitle="Mark and manage daily attendance for each batch.">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-5">
        <div className={sectionClass}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Players</p>
          <p className="mt-2 text-3xl font-black">{attendancePlayers.length}</p>
        </div>
        <div className={sectionClass}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Present</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">{presentCount}</p>
        </div>
        <div className={sectionClass}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Absent</p>
          <p className="mt-2 text-3xl font-black text-red-400">{absentCount}</p>
        </div>
        <div className={sectionClass}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rate</p>
          <p className="mt-2 text-3xl font-black">{attendancePlayers.length ? Math.round((presentCount / attendancePlayers.length) * 100) : 0}%</p>
        </div>
      </div>

      <section className={sectionClass}>
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Select Batch</label>
            <select className={inputClass} value={attendanceBatchId} onChange={(e) => setAttendanceBatchId(e.target.value)}>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name} — {b.timing}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2 block">Date</label>
            <input className={inputClass} type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => markAll('Present')} className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer">
              All Present
            </button>
            <button onClick={() => markAll('Absent')} className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer">
              All Absent
            </button>
          </div>
        </div>

        {attendancePlayers.length === 0 ? (
          <p className="text-sm text-slate-400">No players found in this batch.</p>
        ) : (
          <div className="space-y-3">
            {attendancePlayers.map((player) => (
              <div key={player._id} className="rounded-2xl bg-[#08111f] p-4 border border-[#17304a]/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <span className="text-emerald-400 font-bold text-xs">{player.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{player.name}</p>
                      <p className="text-xs text-slate-500">{player.loginId}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['Present', 'Absent'].map((btnStatus) => (
                      <button
                        key={btnStatus}
                        type="button"
                        onClick={() => setAttendanceMap(prev => ({ ...prev, [player._id]: { ...(prev[player._id] || {}), status: btnStatus } }))}
                        className={`rounded-full px-4 py-2 text-xs font-bold cursor-pointer transition-all ${
                          attendanceMap[player._id]?.status === btnStatus
                            ? btnStatus === 'Present'
                              ? 'bg-emerald-500 text-[#08111f] shadow-lg shadow-emerald-500/20'
                              : 'bg-red-400 text-[#08111f] shadow-lg shadow-red-400/20'
                            : 'bg-[#0d1b2a] text-slate-400 hover:text-white'
                        }`}
                      >
                        {btnStatus}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  className={`${inputClass} mt-3`}
                  placeholder="Optional note..."
                  value={attendanceMap[player._id]?.notes || ''}
                  onChange={(e) => { const val = e.target.value; setAttendanceMap(prev => ({ ...prev, [player._id]: { ...(prev[player._id] || {}), notes: val } })); }}
                />
              </div>
            ))}
          </div>
        )}

        {attendancePlayers.length > 0 && (
          <button
            type="button"
            onClick={onSaveAttendance}
            disabled={saving}
            className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#08111f] hover:bg-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminAttendancePage;
