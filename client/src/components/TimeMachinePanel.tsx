import { useState } from 'react';
import { FastForward, CheckCircle2 } from 'lucide-react';

export default function TimeMachinePanel() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const simulateSentinel = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/interventions/simulate-sentinel', {
        method: 'POST'
      });
      if (res.ok) {
        setSuccess(true);
        window.dispatchEvent(new Event('sentinel-updated'));
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-white font-semibold hidden sm:block drop-shadow-sm">Demo Controls:</div>
      <button 
        onClick={simulateSentinel}
        disabled={loading}
        className="flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-md transition-all px-4 py-1.5 rounded-full text-sm font-bold text-white border border-black/20 shadow-[0_0_15px_rgba(0,0,0,0.4)] disabled:opacity-50"
      >
        {success ? (
          <><CheckCircle2 size={16} className="text-emerald-400 drop-shadow-sm" /> Done</>
        ) : (
          <><FastForward size={16} className="text-white drop-shadow-sm" /> Fast-Forward Time</>
        )}
      </button>
    </div>
  );
}
