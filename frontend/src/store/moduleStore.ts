import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

interface TaskResult {
  taskId: number;
  score: number;
  total: number;
  completed: boolean;
}

interface ModuleResults {
  [moduleId: string]: {
    [taskId: number]: TaskResult;
  };
}

interface ModuleState {
  results: ModuleResults;
  setTaskResult: (moduleId: string, taskId: number, score: number, total: number, userName?: string, userId?: string) => Promise<any>;
  resetModule: (moduleId: string) => void;
  clearResults: () => void;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      results: {},
      setTaskResult: async (moduleId, taskId, score, total, userName, userId) => {
        console.log(`Setting task result: Module ${moduleId}, Task ${taskId}, Score ${score}/${total}, User: ${userName}, ID: ${userId}`);
        // Update local state
        set((state) => ({
          results: {
            ...state.results,
            [moduleId]: {
              ...(state.results[moduleId] || {}),
              [taskId]: { taskId, score, total, completed: true },
            },
          },
        }));

        // Send to backend if userName is provided AND NOT an admin
        const isAdmin = !!localStorage.getItem('adminToken');
        
        if (isAdmin) {
          console.log('Admin session detected. Local state updated, but skipping database persistence.');
          return;
        }

        if (userName && userName.trim()) {
          try {
            console.log('Sending progress to backend...');
            const response = await fetch('https://api.phdp.uz/progress/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: userName.trim(),
                userId,
                moduleId,
                taskId,
                score,
                total,
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('Progress saved successfully:', data);
              // We return the user data so the caller can update their store if needed
              return data;
            } else {
              console.error('Backend save failed:', response.statusText);
            }
          } catch (error) {
            console.error('Progress save error:', error);
          }
        } else {
          console.warn('No userName provided, skipping backend save');
          toast('Iltimos, avvalo tizimga kiring');
        }
      },
      resetModule: (moduleId) =>
        set((state) => {
          const newResults = { ...state.results };
          delete newResults[moduleId];
          return { results: newResults };
        }),
      clearResults: () => set({ results: {} }),
    }),
    {
      name: 'module-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
