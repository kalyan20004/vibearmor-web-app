import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, ShieldAlert } from 'lucide-react';
import TimeMachinePanel from './TimeMachinePanel';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/logout-all', { method: 'POST', credentials: 'include' });
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout all failed', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to completely delete your account? This will permanently erase your data and sever the connection to your Google Calendar and Tasks.")) return;
    
    try {
      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/delete-account', { method: 'DELETE', credentials: 'include' });
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Delete account failed', err);
    }
  };

  return (
    <header className="border-b border-transparent bg-gradient-to-r from-google-blue via-ninja-orange to-google-green sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black text-white hover:opacity-80 transition-opacity">
            Vibe<span className="text-slate-950">Armor</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4 text-sm font-bold">
            <Link to="/dashboard" className="text-white bg-black/20 hover:bg-black/40 border border-black/20 backdrop-blur-md px-4 py-1.5 rounded-full transition-all shadow-[0_0_15px_rgba(0,0,0,0.4)]">
              Dashboard
            </Link>
            <Link to="/insights" className="text-white bg-black/20 hover:bg-black/40 border border-black/20 backdrop-blur-md px-4 py-1.5 rounded-full transition-all shadow-[0_0_15px_rgba(0,0,0,0.4)] flex items-center gap-1.5">
              <Activity size={16} /> 
              Insights
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <TimeMachinePanel />
          
          <div className="hidden md:flex items-center gap-1.5 text-xs text-white font-medium bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/20 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
            <span>Gmail Watcher Active</span>
          </div>
          
          {user && (
            <div className="relative pl-4 border-l border-white/20 ml-2 flex items-center">
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-black/10 p-1.5 pl-3 rounded-full transition-colors border border-white/20"
                >
                  <span className="text-sm font-medium text-white hidden sm:block">
                    {user.email?.split('@')[0]}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </button>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-left"
                        >
                          <LogOut size={16} className="text-slate-400" />
                          Sign Out (This Device)
                        </button>
                        <div className="my-1 border-t border-slate-700/50"></div>
                        <button 
                          onClick={handleLogoutAll}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left group"
                        >
                          <ShieldAlert size={16} className="group-hover:animate-pulse" />
                          Sign out of all devices
                        </button>
                        <div className="my-1 border-t border-slate-700/50"></div>
                        <button 
                          onClick={handleDeleteAccount}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left font-bold"
                        >
                          <ShieldAlert size={16} />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
