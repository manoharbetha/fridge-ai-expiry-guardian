
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
          // Convert date strings back to Date objects
          const itemsWithDates = parsedItems.map((item: any) => ({
            ...item,
            openDate: new Date(item.openDate),
            printedExpiry: new Date(item.printedExpiry),
            predictedExpiry: new Date(item.predictedExpiry)
          }));
          setItems(itemsWithDates);
          console.log('AI Features loaded items:', itemsWithDates.map(item => `${item.name} (${item.status})`));
        } else {
          setItems([]);
          console.log('No items found in localStorage');
        }
      } catch (error) {
        console.error('Error loading items from localStorage:', error);
        setItems([]);
      }
    };

    // Load initial items
    loadItems();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fridgeItems') {
        console.log('Storage changed, reloading items...');
        loadItems();
      }
    };

    // Listen for custom events (when items are updated from same tab)
    const handleItemsUpdate = () => {
      console.log('Items updated event received, reloading...');
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
