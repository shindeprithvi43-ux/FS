import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const AttendancePage = () => {
  const currentDate = new Date();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const load = async () => {
      const [attendanceResponse, summaryResponse] = await Promise.all([
        API.get(`/attendance/my?month=${selectedMonth}&year=${selectedYear}`),
        API.get(`/attendance/my/summary?year=${selectedYear}`)
      ]);

      setAttendance(attendanceResponse.data);
      setSummary(summaryResponse.data);
    };

    load();
  }, [selectedMonth, selectedYear]);

  const currentMonthSummary = summary?.summary?.find((item) => item.month === selectedMonth);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const result = [];

    for (let index = 0; index < firstDay; index += 1) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const record = attendance.find((item) => new Date(item.date).getDate() === day);
      result.push({ day, record });
    }

    return result;
  }, [attendance, selectedMonth, selectedYear]);

  return (
    <DashboardLayout title="Attendance" subtitle="Track your daily attendance and monthly percentage.">
      <div className="flex flex-wrap gap-3">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="rounded-2xl border border-[#1b3a5c] bg-[#0d1b2a] px-4 py-3 text-sm text-white outline-none">
          {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="rounded-2xl border border-[#1b3a5c] bg-[#0d1b2a] px-4 py-3 text-sm text-white outline-none">
          {[2024, 2025, 2026, 2027].map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
          <h3 className="text-lg font-bold">{months[selectedMonth - 1]} {selectedYear}</h3>
          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day}>{day}</div>)}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {calendarDays.map((item, index) => (
              <div
                key={`${item?.day || 'blank'}-${index}`}
                className={`flex aspect-square items-center justify-center rounded-2xl text-sm font-semibold ${!item ? 'bg-transparent' : item.record?.status === 'Present' ? 'bg-emerald-500/10 text-emerald-300' : item.record?.status === 'Absent' ? 'bg-red-500/10 text-red-300' : 'bg-[#08111f] text-slate-500'}`}
              >
                {item?.day || ''}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Monthly Summary</p>
            <p className="mt-4 text-5xl font-black text-white">{currentMonthSummary?.percentage || 0}%</p>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-[#08111f] p-4">Present: {currentMonthSummary?.present || 0}</div>
              <div className="rounded-2xl bg-[#08111f] p-4">Absent: {currentMonthSummary?.absent || 0}</div>
              <div className="rounded-2xl bg-[#08111f] p-4">Total Marked Days: {currentMonthSummary?.total || 0}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
            <h3 className="text-lg font-bold">Detailed History</h3>
            <div className="mt-4 space-y-3">
              {attendance.length ? attendance.map((record) => (
                <div key={record._id} className="rounded-2xl bg-[#08111f] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-white">{new Date(record.date).toLocaleDateString()}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${record.status === 'Present' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{record.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Marked by: {record.markedBy?.name || 'Admin'}</p>
                  {record.notes && <p className="mt-1 text-sm text-slate-500">{record.notes}</p>}
                </div>
              )) : <p className="text-sm text-slate-400">No attendance records found for this month.</p>}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
