
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AIFeatures from './AIFeatures';
import { FridgeItem } from '@/types/FridgeItem';

const AIFeaturesWrapper = () => {
  const [items, setItems] = useState<FridgeItem[]>([]);

  // Get items from localStorage or use mock data
  useEffect(() => {
    // In a real app, you'd get this from a global state management solution
    // For now, we'll use the same mock data
    const mockItems: FridgeItem[] = [
      {
        id: '1',
        name: 'Organic Milk',
        category: 'dairy',
        openDate: new Date('2025-05-25'),
        printedExpiry: new Date('2025-05-30'),
        predictedExpiry: new Date('2025-05-28'),
        status: 'warning',
        notificationSent: false
      },
      {
        id: '2',
        name: 'Greek Yogurt',
        category: 'dairy',
        openDate: new Date('2025-05-20'),
        printedExpiry: new Date('2025-06-05'),
        predictedExpiry: new Date('2025-06-03'),
        status: 'fresh',
        notificationSent: false
      },
      {
        id: '3',
        name: 'Baby Spinach',
        category: 'vegetables',
        openDate: new Date('2025-05-26'),
        printedExpiry: new Date('2025-05-29'),
        predictedExpiry: new Date('2025-05-27'),
        status: 'critical',
        notificationSent: false
      }
    ];
    setItems(mockItems);
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
