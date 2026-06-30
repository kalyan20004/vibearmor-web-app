import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import Insights from './pages/Insights';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-slate-50 font-sans selection:bg-indigo-500/30 relative">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="fixed inset-0 w-full h-full object-cover -z-50"
        >
          <source src="/dashboard.mp4" type="video/mp4" />
        </video>
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-[2px] -z-40 pointer-events-none"></div>

        <Navbar />
        
        <main className="max-w-5xl mx-auto p-4 py-8 relative z-0">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/task/:id" element={<TaskDetail />} />
              <Route path="/insights" element={<Insights />} />
            </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
