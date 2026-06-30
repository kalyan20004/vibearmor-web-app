import { Zap, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in fade-in zoom-in-95 duration-500 relative">
      
      {/* VIBE 2 SHIP Poster Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-google-blue/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-google-red/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-google-green/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-google-yellow/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="space-y-6 max-w-3xl relative z-10">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-google-blue via-ninja-orange to-google-green bg-clip-text text-transparent">
            Never miss a <br className="hidden md:block"/>
            commitment again.
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          VibeArmor is an AI agent that takes ownership of your deadlines. It anticipates failures, breaks down tasks, restructures your calendar, and co-works with you during crises.
        </p>
      </div>

      <div className="pt-8 relative z-10">
        <a 
          href="/auth/google" 
          className="group relative inline-flex items-center gap-3 bg-white text-slate-950 hover:bg-ninja-orange hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(240,90,40,0.3)] hover:shadow-[0_0_60px_rgba(240,90,40,0.5)] hover:-translate-y-1"
        >
          <svg className="w-6 h-6 group-hover:brightness-0 group-hover:invert transition-all" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </a>
        <p className="text-slate-500 text-sm mt-4">
          Requires Google Calendar access to schedule tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl pt-16 border-t border-slate-800 relative z-10">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-google-blue">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-semibold text-slate-200">Autonomous Sentinel</h3>
          <p className="text-slate-400 text-sm">Monitors your commitments 24/7 and calculates failure risk before it happens.</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-google-red">
            <Clock size={24} />
          </div>
          <h3 className="font-semibold text-slate-200">Crisis Intervention</h3>
          <p className="text-slate-400 text-sm">Late night emergency? VibeArmor locks down distractions and co-works with you.</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-google-green">
            <Zap size={24} />
          </div>
          <h3 className="font-semibold text-slate-200">Task Decomposition</h3>
          <p className="text-slate-400 text-sm">Gemini 2.0 Flash breaks overwhelming tasks into atomic, calendar-ready steps.</p>
        </div>
      </div>
    </div>
  );
}
