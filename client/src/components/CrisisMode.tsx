import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, Send, X, Mail, Headphones } from 'lucide-react';

interface CrisisModeProps {
  task: any;
  onDismiss: () => void;
}

export default function CrisisMode({ task, onDismiss }: CrisisModeProps) {
  const [emailDraft, setEmailDraft] = useState('');
  const [drafting, setDrafting] = useState(true);
  
  const domain = task.domain?.toLowerCase() || 'academic';
  const bgImage = domain === 'work' ? '/crisis_work.png' : domain === 'coding' ? '/crisis_coding.png' : '/crisis_academic.png';
  
  // Use youtube-nocookie to bypass strict browser tracking protections that cause black screens
  const musicSrc = domain === 'coding' 
    ? "https://www.youtube-nocookie.com/embed/HDhR2Yhnvfo?autoplay=1" 
    : "https://www.youtube-nocookie.com/embed/n61ULEU7CO0?autoplay=1"; 

  useEffect(() => {
    // 1. Audio Persona (Tough Love)
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Crisis Mode activated for ${task.title}. I have locked down your schedule, drafted an emergency extension request, and cued up a focus playlist. Time is running out. Let's get to work.`;
      msg.rate = 1.0;
      msg.pitch = 0.9;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
         msg.voice = voices.find(v => v.name.includes('Google US English')) || voices[0];
      }
      window.speechSynthesis.speak(msg);
    }

    // 2. Draft Email
    setTimeout(() => {
      setEmailDraft(`Subject: Extension Request: ${task.title}\n\nDear Professor/Manager,\n\nI am writing to respectfully request a 24-hour extension for the ${task.title}. I have been working diligently, but I need a little extra time to ensure the quality of my submission meets expectations.\n\nThank you for your understanding.\n\nBest regards,\n[Your Name]`);
      setDrafting(false);
    }, 1500);
    
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [task]);

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent('Extension Request: ' + task.title)}&body=${encodeURIComponent(emailDraft)}`;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] bg-rose-950/95 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500 bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(to bottom, rgba(76, 5, 25, 0.9), rgba(0, 0, 0, 0.95)), url('${bgImage}')` }}
    >
      <button onClick={onDismiss} className="absolute top-6 right-6 p-2 text-rose-300 hover:text-white hover:bg-rose-900/50 rounded-full transition-colors z-50">
        <X size={24} />
      </button>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Column: Urgency & Music */}
        <div className="text-left space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/20 text-rose-500 mb-2 animate-pulse border border-rose-500/50">
            <ShieldAlert size={40} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl">
            CRISIS MODE ACTIVATED
          </h1>
          
          <p className="text-xl text-rose-100/80 drop-shadow-md">
            You are critically behind on <strong className="text-white">{task.title}</strong>. 
            VibeArmor has locked down your schedule and drafted an emergency extension request.
          </p>
          
          {/* Focus Radio */}
          <div className="bg-black/60 backdrop-blur-md border border-rose-500/30 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-300 font-medium mb-3">
              <Headphones size={18} />
              VibeArmor Focus Radio
            </div>
            <div className="rounded-xl overflow-hidden shadow-inner bg-black">
              <iframe 
                width="100%" 
                height="120" 
                src={musicSrc} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
          </div>
        </div>

        {/* Right Column: Action Plan / Email */}
        <div className="bg-rose-900/40 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-6 shadow-2xl shadow-rose-900/50 h-full flex flex-col">
          <div className="flex items-center gap-2 text-rose-300 font-medium mb-4">
            <Mail size={18} />
            AI Drafted Extension Request
          </div>
          
          {drafting ? (
            <div className="space-y-3 animate-pulse flex-1">
              <div className="h-4 bg-rose-800/50 rounded w-3/4"></div>
              <div className="h-4 bg-rose-800/50 rounded w-full"></div>
              <div className="h-4 bg-rose-800/50 rounded w-5/6"></div>
              <div className="h-4 bg-rose-800/50 rounded w-1/2"></div>
            </div>
          ) : (
            <textarea 
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              className="w-full flex-1 min-h-[250px] bg-rose-950/50 border border-rose-700/50 rounded-lg p-4 text-rose-100 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          )}

          <div className="flex gap-4 mt-6">
            <a 
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                navigator.clipboard.writeText(emailDraft);
                onDismiss();
              }} 
              className="flex-1 bg-white text-rose-950 hover:bg-rose-100 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Send size={18} /> Send Request
            </a>
            <button onClick={onDismiss} className="flex-1 bg-rose-800/80 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors border border-rose-600 backdrop-blur-md">
              I'll do the work
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
