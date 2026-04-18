import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginId || !password) {
      toast.error('Please enter your login ID and password');
      return;
    }

    setLoading(true);
    const result = await login(loginId, password);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Login successful');
    setTimeout(() => navigate(result.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'), 300);
  };

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(211,169,51,0.18),_transparent_35%),linear-gradient(135deg,_#07101d,_#102741)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-[#08111f]">
                <span className="material-symbols-outlined">sports_cricket</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Krishna Cricket Academy</h1>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Academy Portal</p>
              </div>
            </Link>

            <div className="max-w-xl space-y-6">
              <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
                Admin-driven management
              </span>
              <h2 className="text-5xl font-black leading-tight">
                Manage the academy from one system and give every player a focused dashboard.
              </h2>
              <p className="max-w-lg text-lg leading-8 text-slate-300">
                Admins create player accounts, assign batches, track attendance, record performance, publish sessions, and run match operations from a single responsive portal.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                ['Onboarding', 'Admin creates player accounts and shares credentials.'],
                ['Tracking', 'Attendance and performance are updated session by session.'],
                ['Insights', 'Players and staff both see useful progress data.']
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md rounded-[28px] border border-[#1b3a5c] bg-[#0d1b2a] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-[#08111f]">
                <span className="material-symbols-outlined">sports_cricket</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Krishna Cricket Academy</h1>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Portal</p>
              </div>
            </Link>

            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Secure Login</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Sign in with academy credentials</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Players log in with their email and password provided by the admin. Admins can use login ID or email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="loginId" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Email or Login ID
                </label>
                <input
                  id="loginId"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="player@email.com or ADMIN001"
                  className="w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-4 text-sm font-medium text-white outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-2xl border border-[#1b3a5c] bg-[#08111f] px-4 py-4 pr-14 text-sm font-medium text-white outline-none transition focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-4 text-sm font-black uppercase tracking-[0.25em] text-[#08111f] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing In...' : 'Open Dashboard'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-[#1b3a5c] bg-[#08111f] p-4 text-sm text-slate-400">
              New players should contact the academy admin for account creation and batch assignment.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
