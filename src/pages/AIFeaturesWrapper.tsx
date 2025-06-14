
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AIFeatures from './AIFeatures';
import { FridgeItem } from '@/types/FridgeItem';

const AIFeaturesWrapper = () => {
  const [items, setItems] = useState<FridgeItem[]>([]);

  // Get items from localStorage and update when storage changes
  useEffect(() => {
    const loadItems = () => {
      try {
        const storedItems = localStorage.getItem('fridgeItems');
        if (storedItems) {
          const parsedItems = JSON.parse(storedItems);
          setItems(parsedItems);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error('Error loading items from localStorage:', error);
        setItems([]);
      }
    };

    // Load initial items
    loadItems();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fridgeItems') {
        loadItems();
      }
    };

    // Listen for custom events (when items are updated from same tab)
    const handleItemsUpdate = () => {
      loadItems();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fridgeItemsUpdated', handleItemsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fridgeItemsUpdated', handleItemsUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <AIFeatures items={items} />
      </div>
    </div>
  );
};

export default AIFeaturesWrapper;
