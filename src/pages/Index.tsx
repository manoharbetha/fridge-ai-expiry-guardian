
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Dashboard from './Dashboard';
import { FridgeItem } from '@/types/FridgeItem';
import { ParsedFoodItem } from '@/services/geminiService';

const Index = () => {
  const [items, setItems] = useState<FridgeItem[]>([]);

  // Load items from localStorage on mount
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
        } else {
          // Only set mock data if localStorage is empty
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
          localStorage.setItem('fridgeItems', JSON.stringify(mockItems));
        }
      } catch (error) {
        console.error('Error loading items from localStorage:', error);
        setItems([]);
      }
    };

    loadItems();

    // Listen for storage changes from other tabs
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

  // Save items to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('fridgeItems', JSON.stringify(items));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('fridgeItemsUpdated'));
    }
  }, [items]);

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
