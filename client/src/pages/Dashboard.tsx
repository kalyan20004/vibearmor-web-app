import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CalendarDays, Zap, CheckCircle2, BrainCircuit, ShieldAlert } from 'lucide-react';
import AgentChat from '../components/AgentChat';
import { useDeadlines } from '../hooks/useDeadlines';
import NewDeadlineModal from '../components/NewDeadlineModal';
import CrisisMode from '../components/CrisisMode';

export default function Dashboard() {
  const { deadlines, addDeadline, loading, error } = useDeadlines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crisisActive, setCrisisActive] = useState(false);
  const [conflict, setConflict] = useState<any>(null);


  useEffect(() => {
    // Fetch pending conflict interventions
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/interventions')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setConflict(data[0]);
      })
      .catch(console.error);


  }, []);



  const highRisk = deadlines.filter(d => d.risk_score > 70);
  const topRisk = highRisk[0];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4"></div>
        <p className="text-slate-400">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6">
           <AlertCircle size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-white">
          {error === 'Please sign in to view your deadlines.' ? 'Authentication Required' : 'Connection Error'}
        </h2>
        <p className="text-slate-400 max-w-md mb-8 text-lg">
          {error === 'Please sign in to view your deadlines.' 
            ? 'You need to sign in to access the VibeArmor dashboard and view your active commitments.'
            : 'VibeArmor could not connect to the server. Please ensure the backend is running.'}
        </p>
        <button 
          onClick={() => window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/google'} 
          className="bg-google-blue hover:bg-google-blue/80 text-white px-8 py-3 rounded-xl font-medium transition-all hover:-translate-y-1 shadow-lg shadow-google-blue/25 flex items-center gap-3"
        >
          {error === 'Please sign in to view your deadlines.' ? 'Sign In with Google' : 'Retry Connection'}
        </button>
      </div>
    );
  }

  if (crisisActive && topRisk) {
    return <CrisisMode task={topRisk} onDismiss={() => setCrisisActive(false)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-google-blue/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-google-green/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      {conflict && (
        <section className="bg-gradient-to-br from-orange-900/40 to-slate-800/40 border border-orange-500/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-full text-orange-400">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-orange-400">Priority Conflict Detected</h3>
              <p className="text-orange-200/70 text-sm">You have overlapping commitments. Please resolve them.</p>
            </div>
          </div>
          <button onClick={() => setConflict(null)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Resolve Conflict
          </button>
        </section>
      )}

      {topRisk && (
        <section className="bg-gradient-to-br from-ninja-orange/20 to-slate-800/40 border border-ninja-orange/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-ninja-orange/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
                <Zap className="text-google-yellow" fill="currentColor" />
                VibeArmor Sentinel Active
              </h2>
              <p className="text-slate-300 max-w-lg leading-relaxed">
                I am monitoring {deadlines.length} active commitments. Your <span className="font-semibold text-white">{topRisk.title}</span> requires immediate attention. I've prepared an action plan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {topRisk.risk_score > 80 && (
                <button onClick={() => setCrisisActive(true)} className="bg-google-red hover:bg-google-red/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-google-red/20 whitespace-nowrap">
                  Start Crisis Mode
                </button>
              )}
              <Link to={`/task/${topRisk.id}`} className="bg-google-blue hover:bg-google-blue/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-google-blue/20 whitespace-nowrap">
                Review Action Plan
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <CalendarDays size={20} className="text-slate-400" />
              Active Commitments
            </h3>
            <button onClick={() => setIsModalOpen(true)} className="text-google-blue hover:text-google-blue/80 text-sm font-bold transition-colors">
              + New Deadline
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deadlines.map((deadline) => (
              <Link key={deadline.id} to={`/task/${deadline.id}`} className="block group">
                <div className="bg-slate-800/50 border border-slate-700/50 group-hover:border-google-blue/50 transition-all duration-300 rounded-xl p-5 h-full relative overflow-hidden flex flex-col justify-between">
                  
                  {/* Risk Indicator Bar */}
                  <div 
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ 
                      backgroundColor: deadline.risk_score > 80 ? '#f43f5e' : deadline.risk_score > 40 ? '#f59e0b' : '#10b981',
                      opacity: 0.8
                    }}
                  />
                  
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-white group-hover:text-google-blue transition-colors truncate pr-4">{deadline.title}</h4>
                    </div>
                    
                    {/* Google Calendar Sync Badge - Real API Proof */}
                    {(deadline as any).subtasks && (deadline as any).subtasks.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-google-green text-xs font-medium mb-4 bg-google-green/10 inline-flex px-2 py-0.5 rounded border border-google-green/20">
                        <CheckCircle2 size={12} />
                        {(deadline as any).subtasks.length} Blocks Synced
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-google-blue text-xs font-medium mb-4 bg-google-blue/10 inline-flex px-2 py-0.5 rounded border border-google-blue/20 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-google-blue"></div>
                        Awaiting Sentinel AI Breakdown...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                    <div className="text-sm font-semibold text-slate-300">
                      Risk Score: 
                      <span className={`ml-1 ${deadline.risk_score > 80 ? 'text-rose-400 font-bold' : deadline.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {deadline.risk_score}%
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-400">
                      <Clock size={14} className="mr-1" />
                      {new Date(deadline.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {deadlines.length === 0 && (
              <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-20 px-4 bg-slate-800/20 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-google-blue/5 to-ninja-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-16 h-16 mb-6 rounded-2xl bg-google-blue/10 text-google-blue flex items-center justify-center rotate-3 group-hover:-rotate-3 transition-transform duration-500 shadow-sm">
                  <CalendarDays size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Your schedule is clear</h3>
                <p className="text-slate-400 mb-8 max-w-sm text-center">
                  Take a breath, or let VibeArmor help you tackle your next big challenge.
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="relative px-8 py-3 bg-white text-slate-950 font-bold rounded-xl shadow-[0_0_40px_rgba(66,133,244,0.3)] hover:shadow-[0_0_60px_rgba(66,133,244,0.5)] hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <Zap size={18} className="text-ninja-orange" fill="currentColor" />
                  Add First Deadline
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-1">
          <AgentChat />
        </section>
      </div>

      {/* AI Insights & Pattern Learning Proof */}
      <div className="mt-8 border-t border-slate-800 pt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <BrainCircuit className="text-google-blue" />
          AI Insights & Pattern Learning
        </h2>
        
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 mb-1">Risk Calibration</h3>
                <p className="text-sm text-slate-400">VibeArmor is monitoring your completion patterns. If you frequently finish tasks at the last minute, Sentinel AI will artificially inflate your future risk scores to trigger Crisis Mode earlier.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 mb-1">Task Breakdown Memory</h3>
                <p className="text-sm text-slate-400">The Sentinel AI learns how quickly you complete subtasks in specific domains and uses that data to schedule future time blocks more accurately.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <NewDeadlineModal 
          onClose={() => setIsModalOpen(false)}
          onSubmit={addDeadline}
        />
      )}
    </div>
  );
}
