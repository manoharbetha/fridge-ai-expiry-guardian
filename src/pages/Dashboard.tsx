
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ItemDashboard from '@/components/ItemDashboard';
import AddItemForm from '@/components/AddItemForm';
import NotificationPanel from '@/components/NotificationPanel';
import NaturalLanguageInput from '@/components/NaturalLanguageInput';
import { FridgeItem } from '@/types/FridgeItem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Refrigerator, Trash2 } from 'lucide-react';
import { ParsedFoodItem } from '@/services/geminiService';

interface DashboardProps {
  items: FridgeItem[];
  onAddItem: (item: Omit<FridgeItem, 'id' | 'status'>) => void;
  onAddItemsFromAI: (items: ParsedFoodItem[]) => void;
  onRemoveItem: (id: string) => void;
  onRemoveExpiredItems: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  items, 
  onAddItem, 
  onAddItemsFromAI, 
  onRemoveItem,
  onRemoveExpiredItems 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const expiringItems = items.filter(item => item.status === 'critical' || item.status === 'warning');
  const expiredItems = items.filter(item => {
    const today = new Date();
    const soonestExpiry = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
    return soonestExpiry < today;
  });

  const handleAddItem = (newItem: Omit<FridgeItem, 'id' | 'status'>) => {
    onAddItem(newItem);
    setShowAddForm(false);
  };

  const handleRemoveExpired = () => {
    onRemoveExpiredItems();
    toast.success(`Removed ${expiredItems.length} expired items`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Refrigerator className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
              Fridge Dashboard
            </h1>
            <p className="text-gray-600">Manage your fridge items and track expiry dates</p>
          </div>
        </div>
        <div className="flex gap-3">
          {expiredItems.length > 0 && (
            <Button 
              onClick={handleRemoveExpired}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove {expiredItems.length} Expired
            </Button>
          )}
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="lg:col-span-2 space-y-6">
          <ItemDashboard items={items} onRemoveItem={onRemoveItem} />
          <NaturalLanguageInput onItemsParsed={onAddItemsFromAI} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <NotificationPanel items={expiringItems} />
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <AddItemForm 
              onAddItem={handleAddItem} 
              onCancel={() => setShowAddForm(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
