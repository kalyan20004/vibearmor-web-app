import { useState } from 'react';
import { X, Calendar as CalendarIcon, Briefcase, GraduationCap, User } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (deadline: { title: string; due_at: string; domain: string; stakes: string }) => void;
}

export default function NewDeadlineModal({ onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [domain, setDomain] = useState('Academic');
  const [stakes, setStakes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;
    
    // Combine date and time to ISO string
    const due_at = new Date(`${date}T${time}`).toISOString();
    
    onSubmit({ title, due_at, domain, stakes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="text-indigo-400" />
            New Commitment
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">What needs to be done?</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Physics Lab Report" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
              <input 
                required
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Time</label>
              <input 
                required
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Domain</label>
            <div className="flex gap-2">
              {['Academic', 'Work', 'Personal'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDomain(d)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-sm transition-all ${
                    domain === d ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {d === 'Academic' && <GraduationCap size={16} />}
                  {d === 'Work' && <Briefcase size={16} />}
                  {d === 'Personal' && <User size={16} />}
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Consequence (What happens if missed?)</label>
            <input 
              type="text" 
              value={stakes}
              onChange={e => setStakes(e.target.value)}
              placeholder="e.g. Lose 10% of final grade" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              Add Commitment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
