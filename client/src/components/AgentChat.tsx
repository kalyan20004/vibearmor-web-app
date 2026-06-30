import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AgentChat() {
  const [messages, setMessages] = useState<{role: 'agent'|'user', content: string}[]>([
    { role: 'agent', content: 'I am VibeArmor. How can I help you optimize your schedule today?' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize Web Speech API for voice assistance
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    
    // Add empty agent message that we will stream into
    setMessages(prev => [...prev, { role: 'agent', content: '' }]);

    const es = new EventSource(`/interventions/chat/stream?message=${encodeURIComponent(userMessage)}`);
    
    es.onmessage = (event) => {
      if (event.data === '[DONE]') {
        es.close();
        return;
      }
      try {
        const parsed = JSON.parse(event.data);
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + parsed.chunk
          };
          return newMessages;
        });
      } catch (err) {}
    };

    es.onerror = () => {
      es.close();
    };
  };

  return (
    <div className="relative w-full h-[500px]">
      <div className={`flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 origin-top-right ${isExpanded ? 'absolute top-0 right-0 w-[800px] max-w-[90vw] h-[600px] z-[100]' : 'w-full h-[500px]'}`}>
        <div className="bg-indigo-900/50 p-4 border-b border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="text-indigo-400" />
            <h3 className="font-bold text-slate-100">VibeArmor Co-Pilot</h3>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-indigo-400 hover:text-white transition-colors">
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'agent' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-300'}`}>
                {msg.role === 'agent' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-3 text-sm overflow-hidden ${msg.role === 'agent' ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    a: ({node, ...props}) => <a className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2">
          <button 
            type="button" 
            onClick={toggleVoice}
            className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {isListening ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask VibeArmor to schedule a task..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-200"
          />
          <button type="submit" disabled={!input.trim()} className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
