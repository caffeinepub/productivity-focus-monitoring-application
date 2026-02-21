import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { useGetAllAppCategories } from './useQueries';
import { Category } from '../backend';

interface Application {
  id: string;
  name: string;
  category: 'productive' | 'distracting' | 'neutral';
}

const DEFAULT_APPS: Application[] = [
  { id: '1', name: 'Visual Studio Code', category: 'productive' },
  { id: '2', name: 'IntelliJ IDEA', category: 'productive' },
  { id: '3', name: 'Microsoft Word', category: 'productive' },
  { id: '4', name: 'Google Docs', category: 'productive' },
  { id: '5', name: 'GitHub', category: 'productive' },
  { id: '6', name: 'Stack Overflow', category: 'productive' },
  { id: '7', name: 'Notion', category: 'productive' },
  { id: '8', name: 'Slack', category: 'productive' },
  { id: '9', name: 'Facebook', category: 'distracting' },
  { id: '10', name: 'Instagram', category: 'distracting' },
  { id: '11', name: 'Twitter/X', category: 'distracting' },
  { id: '12', name: 'YouTube', category: 'distracting' },
  { id: '13', name: 'TikTok', category: 'distracting' },
  { id: '14', name: 'Reddit', category: 'distracting' },
  { id: '15', name: 'Netflix', category: 'distracting' },
];

export function useApplications() {
  const { actor } = useActor();
  const { data: backendCategories = [], isLoading } = useGetAllAppCategories();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with backend data or defaults
  useEffect(() => {
    if (isLoading || isInitialized) return;

    if (backendCategories.length > 0) {
      const apps = backendCategories.map(([name, category], index) => ({
        id: index.toString(),
        name,
        category: mapBackendCategory(category),
      }));
      setApplications(apps);
    } else {
      setApplications(DEFAULT_APPS);
      // Sync defaults to backend
      if (actor) {
        DEFAULT_APPS.forEach((app) => {
          const backendCat = mapToBackendCategory(app.category);
          actor.setAppCategory(app.name, backendCat).catch(console.error);
        });
      }
    }
    setIsInitialized(true);
  }, [backendCategories, isLoading, actor, isInitialized]);

  const addApplication = async (name: string, category: 'productive' | 'distracting' | 'neutral') => {
    const newApp: Application = {
      id: Date.now().toString(),
      name,
      category,
    };
    
    if (actor) {
      try {
        const backendCat = mapToBackendCategory(category);
        await actor.setAppCategory(name, backendCat);
        setApplications([...applications, newApp]);
      } catch (error) {
        console.error('Failed to add application:', error);
      }
    }
  };

  const updateApplication = async (id: string, name: string, category: 'productive' | 'distracting' | 'neutral') => {
    if (actor) {
      try {
        const backendCat = mapToBackendCategory(category);
        await actor.setAppCategory(name, backendCat);
        setApplications(
          applications.map((app) => (app.id === id ? { ...app, name, category } : app))
        );
      } catch (error) {
        console.error('Failed to update application:', error);
      }
    }
  };

  const removeApplication = (id: string) => {
    setApplications(applications.filter((app) => app.id !== id));
  };

  return {
    applications,
    addApplication,
    updateApplication,
    removeApplication,
    isLoading,
  };
}

function mapBackendCategory(category: Category): 'productive' | 'distracting' | 'neutral' {
  switch (category) {
    case Category.productive:
      return 'productive';
    case Category.distracting:
      return 'distracting';
    case Category.neutral:
      return 'neutral';
    default:
      return 'neutral';
  }
}

function mapToBackendCategory(category: 'productive' | 'distracting' | 'neutral'): Category {
  switch (category) {
    case 'productive':
      return Category.productive;
    case 'distracting':
      return Category.distracting;
    case 'neutral':
      return Category.neutral;
    default:
      return Category.neutral;
  }
}
