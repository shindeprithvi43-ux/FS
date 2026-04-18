import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user?.role === 'admin'
    ? [
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
        { path: '/admin/players', label: 'Players', icon: 'group' },
        { path: '/admin/batches', label: 'Batches', icon: 'view_list' },
        { path: '/admin/attendance', label: 'Attendance', icon: 'calendar_month' },
        { path: '/admin/performance', label: 'Performance', icon: 'analytics' },
        { path: '/admin/sessions', label: 'Sessions', icon: 'sports' },
        { path: '/admin/announcements', label: 'Announcements', icon: 'campaign' },
        { path: '/admin/matches', label: 'Matches', icon: 'emoji_events' }
      ]
    : [
        { path: '/user/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/user/attendance', label: 'Attendance', icon: 'calendar_month' },
        { path: '/user/performance', label: 'Performance', icon: 'analytics' },
        { path: '/user/sessions', label: 'Sessions', icon: 'sports' },
        { path: '/user/announcements', label: 'Announcements', icon: 'campaign' },
        { path: '/user/matches', label: 'Matches', icon: 'emoji_events' }
      ];

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside className={`fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col border-r border-[#1b3a5c] bg-[#0d1b2a] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-[#1b3a5c]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="material-symbols-outlined text-white text-xl">sports_cricket</span>
          </div>
          <div>
            <h1 className="text-white text-sm font-bold tracking-tight leading-none">Krishna Cricket</h1>
            <span className="text-emerald-400 text-[10px] font-bold tracking-[0.15em] uppercase">Academy</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#1b3a5c] text-slate-300 lg:hidden"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="p-6 border-b border-[#1b3a5c]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 font-bold text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'Player'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.loginId || ''}</p>
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            {user?.role === 'admin' ? 'Admin' : 'Player'}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
              ${isActive
                ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1b3a5c]">
        <NavLink
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all mb-1"
        >
          <span className="material-symbols-outlined text-xl">home</span>
          Home
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all w-full cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Logout
        </button>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
