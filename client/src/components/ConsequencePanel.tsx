import { useState, useEffect } from 'react';
import { Skull, AlertTriangle, TrendingDown } from 'lucide-react';

interface Props {
  deadlineId: string;
  stakes?: string;
  title: string;
}

export default function ConsequencePanel({ deadlineId, stakes, title }: Props) {
  const [loading, setLoading] = useState(true);
  const [consequences, setConsequences] = useState<string[]>([]);

  useEffect(() => {
    // In a real app this would fetch from /api/deadlines/:id/consequences
    // We mock the AI response here for the demo based on stakes and title
    setTimeout(() => {
      if (stakes) {
        setConsequences([
          stakes,
          "Potential cascade effect on upcoming commitments",
          "Increased stress leading into next week"
        ]);
      } else if (title.toLowerCase().includes('midterm') || title.toLowerCase().includes('assignment')) {
        setConsequences([
          "Drop in overall course grade by approximately 10-15%",
          "Loss of eligibility for academic honors this semester",
          "Increased pressure on final exam performance"
        ]);
      } else if (title.toLowerCase().includes('hackathon')) {
        setConsequences([
          "Loss of potential $5k prize money and networking opportunities",
          "Wasted effort of previous weekend's work",
          "Missed portfolio piece for upcoming job interviews"
        ]);
      } else {
        setConsequences([
          "Failure to meet commitment",
          "Reputational damage",
          "Stress compounding"
        ]);
      }
      setLoading(false);
    }, 1200);
  }, [deadlineId, stakes, title]);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-100">
        <Skull size={18} className="text-slate-400" />
        Consequence Modeling
      </h3>
      
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
      ) : (
        <ul className="space-y-3">
          {consequences.map((c, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-300">
              {i === 0 ? <AlertTriangle size={16} className="text-red-400 mt-1 shrink-0" /> : <TrendingDown size={16} className="text-orange-400 mt-1 shrink-0" />}
              <span>{c}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
