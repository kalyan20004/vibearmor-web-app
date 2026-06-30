import { useState, useEffect, useCallback } from 'react';

export interface Deadline {
  id: string;
  title: string;
  due_at: string;
  risk_score: number;
  status: string;
  domain?: string;
  stakes?: string;
  completion_pct?: number;
}

export function useDeadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeadlines = useCallback(async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/deadlines', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view your deadlines.');
        } else {
          setError('Failed to fetch deadlines.');
        }
        return;
      }
      const data = await response.json();
      setDeadlines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeadlines();

    // Auto-poll every 5 seconds so AI updates magically appear without refreshing
    const interval = setInterval(() => {
      fetchDeadlines();
    }, 5000);

    // Listen for manual triggers from the UI
    window.addEventListener('sentinel-updated', fetchDeadlines);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sentinel-updated', fetchDeadlines);
    };
  }, [fetchDeadlines]);

  const addDeadline = async (deadline: Omit<Deadline, 'id' | 'risk_score' | 'status'>) => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(deadline),
      });
      if (response.ok) {
        await fetchDeadlines(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to add deadline', err);
    }
  };

  const deleteDeadline = async (id: string) => {
    try {
      const response = await fetch(`/deadlines/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        await fetchDeadlines(); // Refresh list
        return true;
      }
    } catch (err) {
      console.error('Failed to delete deadline', err);
    }
    return false;
  };

  const getDeadline = (id: string) => deadlines.find(d => d.id === id);

  return { deadlines, addDeadline, deleteDeadline, getDeadline, loading, error };
}
