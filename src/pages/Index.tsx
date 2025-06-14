
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Dashboard from './Dashboard';
import { FridgeItem } from '@/types/FridgeItem';
import { ParsedFoodItem } from '@/services/geminiService';

const Index = () => {
  const [items, setItems] = useState<FridgeItem[]>([]);

  // Mock initial data
  useEffect(() => {
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

  const addItem = (newItem: Omit<FridgeItem, 'id' | 'status'>) => {
    const item: FridgeItem = {
      ...newItem,
      id: Date.now().toString(),
      status: getDaysUntilExpiry(newItem.predictedExpiry) <= 2 ? 'critical' : 
             getDaysUntilExpiry(newItem.predictedExpiry) <= 5 ? 'warning' : 'fresh'
    };
    setItems(prev => [...prev, item]);
    toast.success('Item added to your fridge!');
  };

  const addItemsFromAI = (parsedItems: ParsedFoodItem[]) => {
    const today = new Date();
    const defaultExpiry = new Date();
    defaultExpiry.setDate(today.getDate() + 7); // Default 1 week expiry
    
    parsedItems.forEach(parsedItem => {
      const newItem: Omit<FridgeItem, 'id' | 'status'> = {
        name: parsedItem.name,
        category: parsedItem.category,
        openDate: today,
        printedExpiry: defaultExpiry,
        predictedExpiry: defaultExpiry,
        notificationSent: false
      };
      addItem(newItem);
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from fridge');
  };

  const removeExpiredItems = () => {
    const today = new Date();
    const expiredItems = items.filter(item => {
      const soonestExpiry = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
      return soonestExpiry < today;
    });
    
    setItems(prev => prev.filter(item => {
      const soonestExpiry = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
      return soonestExpiry >= today;
    }));
    
    return expiredItems.length;
  };

  const getDaysUntilExpiry = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Dashboard
          items={items}
          onAddItem={addItem}
          onAddItemsFromAI={addItemsFromAI}
          onRemoveItem={removeItem}
          onRemoveExpiredItems={removeExpiredItems}
        />
      </div>
    </div>
  );
};

export default Index;
