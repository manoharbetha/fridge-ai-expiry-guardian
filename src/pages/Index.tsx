
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ItemDashboard from '@/components/ItemDashboard';
import AddItemForm from '@/components/AddItemForm';
import NotificationPanel from '@/components/NotificationPanel';
import { FridgeItem } from '@/types/FridgeItem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Refrigerator } from 'lucide-react';

const Index = () => {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

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
    setShowAddForm(false);
    toast.success('Item added to your fridge!');
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from fridge');
  };

  const getDaysUntilExpiry = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expiringItems = items.filter(item => item.status === 'critical' || item.status === 'warning');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Refrigerator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                Smart Fridge Manager
              </h1>
              <p className="text-gray-600">AI-powered expiry tracking and waste reduction</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{items.length}</div>
              <div className="text-gray-600">Total Items</div>
            </div>
          </Card>
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{expiringItems.length}</div>
              <div className="text-gray-600">Expiring Soon</div>
            </div>
          </Card>
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {items.filter(item => item.status === 'fresh').length}
              </div>
              <div className="text-gray-600">Fresh Items</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard */}
          <div className="lg:col-span-2">
            <ItemDashboard items={items} onRemoveItem={removeItem} />
          </div>

          {/* Notifications Panel */}
          <div>
            <NotificationPanel items={expiringItems} />
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <AddItemForm 
                onAddItem={addItem} 
                onCancel={() => setShowAddForm(false)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
