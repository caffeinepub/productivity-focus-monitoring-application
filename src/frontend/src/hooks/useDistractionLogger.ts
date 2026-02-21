import { useState } from 'react';
import { useActor } from './useActor';
import { Category, SourceType } from '../backend';

const STORAGE_KEY = 'distraction-count';

export function useDistractionLogger() {
  const { actor } = useActor();
  const [showModal, setShowModal] = useState(false);
  const [distractionCount, setDistractionCount] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const logDistraction = async (
    source: string,
    category: 'productive' | 'distracting' | 'neutral',
    sourceType: string,
    description: string
  ) => {
    if (!actor) return;

    try {
      // Map frontend category to backend Category enum
      const backendCategory: Category = 
        category === 'productive' ? Category.productive :
        category === 'distracting' ? Category.distracting :
        Category.neutral;

      // Map sourceType string to backend SourceType enum
      const backendSourceType: SourceType = 
        sourceType === 'workApp' ? SourceType.workApp :
        sourceType === 'socialMedia' ? SourceType.socialMedia :
        sourceType === 'news' ? SourceType.news :
        sourceType === 'shopping' ? SourceType.shopping :
        SourceType.other;

      await actor.logDistraction(source, backendCategory, backendSourceType, description);
      
      const newCount = distractionCount + 1;
      setDistractionCount(newCount);
      localStorage.setItem(STORAGE_KEY, newCount.toString());
      
      closeModal();
    } catch (error) {
      console.error('Failed to log distraction:', error);
      throw error;
    }
  };

  const resetCount = () => {
    setDistractionCount(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    showModal,
    openModal,
    closeModal,
    logDistraction,
    distractionCount,
    resetCount,
  };
}
