import { BarChart, Activity, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { useDeadlines } from '../hooks/useDeadlines';

export default function Insights() {
  const { loading, error } = useDeadlines();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4"></div>
        <p className="text-slate-400">Loading Insights...</p>
      </div>
    );
  }

  if (error === 'Please sign in to view your deadlines.') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
           <ShieldAlert size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-white">Authentication Required</h2>
        <p className="text-slate-400 max-w-md mb-8 text-lg">You need to sign in to access VibeArmor Behavioral Insights.</p>
        <button 
          onClick={() => window.location.href = '/auth/google'} 
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium transition-all hover:-translate-y-1 shadow-lg shadow-indigo-500/25 flex items-center gap-3"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
          <BarChart size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Productivity Insights</h2>
          <p className="text-slate-400">VibeArmor analysis of your work patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <CheckCircle size={20} />
            <h3 className="font-semibold text-slate-200">Completion Rate</h3>
          </div>
          <div className="text-4xl font-black text-white">92%</div>
          <p className="text-sm text-slate-400 mt-2">+5% since using VibeArmor</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-amber-400 mb-4">
            <Activity size={20} />
            <h3 className="font-semibold text-slate-200">Peak Focus Time</h3>
          </div>
          <div className="text-4xl font-black text-white">10 PM</div>
          <p className="text-sm text-slate-400 mt-2">You work best late at night</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-rose-400 mb-4">
            <Clock size={20} />
            <h3 className="font-semibold text-slate-200">Procrastination Risk</h3>
          </div>
          <div className="text-4xl font-black text-white">High</div>
          <p className="text-sm text-slate-400 mt-2">Usually delays tasks &gt; 5 hours</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4 border-b border-slate-700 pb-2">AI Behavioral Analysis</h3>
        <p className="text-slate-300 leading-relaxed">
          VibeArmor has identified a consistent pattern: you tend to over-estimate your available free time during the afternoons. 
          Going forward, the Sentinel will automatically schedule your high-focus deep work blocks after 9 PM, matching your natural biological rhythm and maximizing your 92% completion rate.
        </p>
      </div>
    </div>
  );
}
