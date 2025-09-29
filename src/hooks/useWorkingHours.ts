import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface WorkingHour {
  id: number;
  day: string;
  time_frame: string;
  is_active: boolean;
}

export const useWorkingHours = () => {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getWorkingHours();
      setWorkingHours(data);
    } catch (err) {
      console.error('Error fetching working hours:', err);
      setError('Failed to fetch working hours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  return {
    workingHours,
    loading,
    error,
    refetch: fetchWorkingHours,
  };
};
