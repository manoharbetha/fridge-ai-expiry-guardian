import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ItemDashboard from '@/components/ItemDashboard';
import AddItemForm from '@/components/AddItemForm';
import NotificationPanel from '@/components/NotificationPanel';
import NaturalLanguageInput from '@/components/NaturalLanguageInput';
import RecipeRecommendations from '@/components/RecipeRecommendations';
import SmartQuery from '@/components/SmartQuery';
import { FridgeItem } from '@/types/FridgeItem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Refrigerator, Trash2, LogOut } from 'lucide-react';
import { ParsedFoodItem } from '@/services/geminiService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

// Utility: Convert db row to FridgeItem (dates as Date objects, status normalized)
function parseDbFridgeItem(row: any): FridgeItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    openDate: row.open_date ? new Date(row.open_date) : new Date(),
    printedExpiry: row.printed_expiry ? new Date(row.printed_expiry) : new Date(),
    predictedExpiry: row.predicted_expiry ? new Date(row.predicted_expiry) : new Date(),
    status: typeof row.status === 'string' && ['fresh', 'warning', 'critical', 'expired'].includes(row.status) ? row.status : 'fresh',
    notificationSent: !!row.notification_sent,
  };
}

// Utility: Convert FridgeItem to db insert/update row
function fridgeItemToDbRow(item: Omit<FridgeItem, 'id' | 'status'> & {status:string}, userId: string) {
  return {
    name: item.name,
    category: item.category,
    open_date: item.openDate.toISOString().slice(0, 10),
    printed_expiry: item.printedExpiry.toISOString().slice(0, 10),
    predicted_expiry: item.predictedExpiry.toISOString().slice(0, 10),
    status: item.status,
    notification_sent: item.notificationSent,
    user_id: userId,
    expiry_date: item.predictedExpiry.toISOString().slice(0, 10), // for legacy/support
  };
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/auth');
    }
  }, [session, loading, navigate]);

  // Load user's items from Supabase
  useEffect(() => {
    if (session?.user) {
      setItemsLoading(true);
      (async () => {
        try {
          const { data, error } = await supabase
            .from('food_items')
            .select('*')
            .order('predicted_expiry', { ascending: true });
          if (error) {
            toast.error('Could not load fridge items.');
            setItems([]);
          } else if (data) {
            setItems(data.map(parseDbFridgeItem));
          }
        } finally {
          setItemsLoading(false);
        }
      })();
    }
  }, [session?.user]);

  // Helper for expiry status
  const getDaysUntilExpiry = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const getStatusFromPredicted = (predictedExpiryDate: Date) => {
    const days = getDaysUntilExpiry(predictedExpiryDate);
    if (days < 0) return 'expired';
    if (days <= 2) return 'critical';
    if (days <= 5) return 'warning';
    return 'fresh';
  };

  // Add a single item to Supabase
  const addItem = async (newItem: Omit<FridgeItem, 'id' | 'status'>) => {
    if (!session?.user) return;
    const status = getStatusFromPredicted(newItem.predictedExpiry);
    const dbRow = fridgeItemToDbRow({ ...newItem, status }, session.user.id);
    const { data, error } = await supabase
      .from('food_items')
      .insert([dbRow])
      .select()
      .maybeSingle();
    if (error) {
      toast.error('Error adding item.');
    } else if (data) {
      setItems(prev => [...prev, parseDbFridgeItem(data)]);
      setShowAddForm(false);
      toast.success('Item added to your fridge!');
    }
  };

  // Add multiple items (from AI) to Supabase
  const addItemsFromAI = async (parsedItems: ParsedFoodItem[]) => {
    if (!session?.user) return;
    const today = new Date();
    const defaultExpiry = new Date();
    defaultExpiry.setDate(today.getDate() + 7); // Default 1 week expiry
    for (const parsedItem of parsedItems) {
      const newItem: Omit<FridgeItem, 'id' | 'status'> = {
        name: parsedItem.name,
        category: parsedItem.category,
        openDate: today,
        printedExpiry: defaultExpiry,
        predictedExpiry: defaultExpiry,
        notificationSent: false
      };
      await addItem(newItem);
    }
  };

  // Remove item from Supabase
  const removeItem = async (id: string) => {
    const { error } = await supabase.from('food_items').delete().eq('id', id);
    if (error) {
      toast.error('Error removing item.');
    } else {
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removed from fridge');
    }
  };

  // Remove expired items from Supabase
  const removeExpiredItems = async () => {
    const today = new Date();
    const expiredItems = items.filter(item => {
      const expiryDate = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
      return expiryDate < today;
    });
    if (expiredItems.length === 0) {
      toast.info('No expired items to remove');
      return;
    }
    const expiredIds = expiredItems.map(item => item.id);
    const { error } = await supabase.from('food_items').delete().in('id', expiredIds);
    if (error) {
      toast.error('Failed to remove expired items');
    } else {
      setItems(prev => prev.filter(item => !expiredIds.includes(item.id)));
      toast.success(`Removed ${expiredItems.length} expired item(s)`);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const expiringItems = items.filter(item => item.status === 'critical' || item.status === 'warning');
  const expiredItemsCount = items.filter(item => {
    const today = new Date();
    const expiryDate = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
    return expiryDate < today;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{session.user.email}</p>
              <p className="text-xs text-gray-500">Welcome!</p>
            </div>
            {expiredItemsCount > 0 && (
              <Button 
                onClick={removeExpiredItems}
                variant="destructive"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Expired ({expiredItemsCount})
              </Button>
            )}
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button variant="outline" onClick={handleLogout} className="shadow-lg hover:shadow-xl transition-all duration-300">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{expiredItemsCount}</div>
              <div className="text-gray-600">Expired Items</div>
            </div>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="space-y-8">
          <NaturalLanguageInput onItemsParsed={addItemsFromAI} />
          <SmartQuery items={items} />
          <NotificationPanel items={expiringItems} />
          <ItemDashboard items={items} onRemoveItem={removeItem} />
          <RecipeRecommendations items={items} />
          {itemsLoading && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 shadow-lg text-center text-lg">
                Loading your fridge items...
              </div>
            </div>
          )}
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
