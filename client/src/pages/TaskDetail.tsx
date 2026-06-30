import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import CrisisMode from '../components/CrisisMode';
import ConsequencePanel from '../components/ConsequencePanel';
import { useDeadlines } from '../hooks/useDeadlines';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDeadline, deleteDeadline, loading, error } = useDeadlines();
  const [crisisActive, setCrisisActive] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      const deadline = getDeadline(id);
      if (deadline) {
        // Sort real subtasks by order_index
        const d: any = deadline;
        const sortedSubtasks = [...(d.subtasks || [])].sort((a: any, b: any) => a.order_index - b.order_index);
        setTask({ ...deadline, subtasks: sortedSubtasks });
      }
    }
  }, [id, getDeadline]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4"></div>
        <p className="text-slate-400">Loading Action Plan...</p>
      </div>
    );
  }

  if (error === 'Please sign in to view your deadlines.') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
           <ShieldAlert size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-white">Authentication Required</h2>
        <p className="text-slate-400 max-w-md mb-8 text-lg">You need to sign in to access the VibeArmor Action Plan for this commitment.</p>
        <button 
          onClick={() => window.location.href = '/auth/google'} 
          className="bg-google-blue hover:bg-google-blue/90 text-white px-8 py-3 rounded-xl font-medium transition-all hover:-translate-y-1 shadow-lg shadow-google-blue/25 flex items-center gap-3"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (!task) return <div className="p-8 text-center text-slate-400">Task not found</div>;

  if (crisisActive) {
    return <CrisisMode task={task} onDismiss={() => setCrisisActive(false)} />;
  }

  const handleDelete = async () => {
    if (id && confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      setIsDeleting(true);
      const success = await deleteDeadline(id);
      if (success) {
        navigate('/dashboard');
      } else {
        setIsDeleting(false);
        alert('Failed to delete task.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white">{task.title}</h2>
        </div>
        
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 hover:bg-google-red/10 text-google-red hover:text-google-red/80 rounded-full transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          {isDeleting ? <div className="w-5 h-5 rounded-full border-2 border-google-red/30 border-t-google-red animate-spin"></div> : <Trash2 size={20} />}
          <span className="hidden sm:inline">Delete Task</span>
        </button>
      </div>

      {task.risk_score > 70 && (
        <div className="bg-google-red/5 border border-google-red/20 rounded-xl p-5 flex items-start gap-4">
          <ShieldAlert className="text-google-red shrink-0 mt-0.5" />
          <div>
            <h3 className="text-google-red font-bold text-lg mb-1">Critical Risk Detected</h3>
            <p className="text-google-red/80 mb-3 text-sm">
              You are significantly behind schedule for this deadline. VibeArmor recommends activating Crisis Mode to clear your schedule and draft an extension email.
            </p>
            <button 
              onClick={() => setCrisisActive(true)}
              className="bg-google-red hover:bg-google-red/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Activate Crisis Mode
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700/50 shadow-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">AI Decomposed Action Plan</h3>
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Sentinel AI Finished
            </div>
          )}
        </div>
        
        {(!task.subtasks || task.subtasks.length === 0) ? (
          <div className="text-center py-8 text-slate-500 flex flex-col items-center justify-center">
             <div className="w-8 h-8 rounded-full border-2 border-google-blue/30 border-t-google-blue animate-spin mb-3"></div>
             <p>Sentinel AI is analyzing and breaking down this task...</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            {task.subtasks.map((sub: any) => {
              const isCooldown = sub.title?.includes("Cooldown") || sub.title?.includes("Burnout");
              
              return (
                <div key={sub.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 ${isCooldown ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-900 text-slate-400'} shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                    {sub.status === 'completed' ? <CheckCircle2 className="text-emerald-400" /> : <Circle size={14} />}
                  </div>
                  
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${isCooldown ? 'border-orange-500/20 bg-orange-500/5' : 'border-slate-700/50 bg-slate-900/50'} shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`font-bold ${isCooldown ? 'text-orange-400' : 'text-slate-200'}`}>{sub.title}</div>
                      <div className={`text-xs font-mono px-2 py-0.5 rounded ${isCooldown ? 'text-orange-300 bg-orange-500/20' : 'text-indigo-300 bg-indigo-500/20'}`}>
                        {sub.duration_minutes}m
                      </div>
                    </div>
                    {sub.description && (
                      <p className="text-sm text-slate-400 mb-3">{sub.description}</p>
                    )}
                    
                    {/* Raw API Proof - Calendar Sync Badge */}
                    {sub.calendar_event_id && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 w-fit px-2 py-1 rounded mt-1">
                        <CheckCircle2 size={12} />
                        Synced to Google Calendar
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConsequencePanel deadlineId={task.id} stakes={task.stakes} title={task.title} />
    </div>
  );
}
