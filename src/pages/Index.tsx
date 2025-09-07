import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/ui/HeroSection';
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
import HeaderBar from '@/components/HeaderBar';
import FridgeStatsCards from '@/components/FridgeStatsCards';

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
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
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

  // Handle edit item
  const handleEditItem = (id: string) => {
    const itemToEdit = items.find(item => item.id === id);
    if (itemToEdit) {
      setEditingItem(itemToEdit);
    }
  };

  // Update item in Supabase
  const updateItem = async (updatedItem: FridgeItem) => {
    if (!session?.user) return;
    const status = getStatusFromPredicted(updatedItem.predictedExpiry);
    const dbRow = fridgeItemToDbRow({ ...updatedItem, status }, session.user.id);
    
    const { data, error } = await supabase
      .from('food_items')
      .update(dbRow)
      .eq('id', updatedItem.id)
      .select()
      .maybeSingle();
      
    if (error) {
      toast.error('Error updating item.');
    } else if (data) {
      setItems(prev => prev.map(item => item.id === updatedItem.id ? parseDbFridgeItem(data) : item));
      setEditingItem(null);
      toast.success('Item updated successfully!');
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

  // Purge ALL expired items - hard delete
  const purgeExpiredItems = async () => {
    const today = new Date();
    const expiredItems = items.filter(item => {
      const expiryDate = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
      return expiryDate < today;
    });
    if (expiredItems.length === 0) {
      toast.info('No expired items to purge');
      return;
    }
    const expiredIds = expiredItems.map(item => item.id);
    // Permanently delete expired items
    const { error } = await supabase.from('food_items').delete().in('id', expiredIds);
    if (error) {
      toast.error('Failed to purge expired items');
    } else {
      setItems(prev => prev.filter(item => !expiredIds.includes(item.id)));
      toast.success(`Purged ${expiredItems.length} expired item(s) permanently`);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-background dark:via-[#222d24] dark:to-[#14281e]">
        <div className="text-gray-600 dark:text-gray-200">Loading...</div>
      </div>
    );
  }

  const expiringItems = items.filter(item => item.status === 'critical' || item.status === 'warning');
  const expiredItemsCount = items.filter(item => {
    const today = new Date();
    const expiryDate = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
    return expiryDate < today;
  }).length;
  const freshItemsCount = items.filter(item => item.status === 'fresh').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 
      dark:from-[#283e51] dark:via-[#485563] dark:to-[#232526] transition-colors dark:text-black">
      {/* --- HEADERBAR AT TOP --- */}
      <HeaderBar
        email={session.user.email}
        expiredItemsCount={expiredItemsCount}
        onPurgeExpired={purgeExpiredItems}
        onLogout={handleLogout}
      />
      {/* --- HERO SECTION BELOW HEADER --- */}
      <HeroSection />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <FridgeStatsCards
          total={items.length}
          expiring={expiringItems.length}
          fresh={freshItemsCount}
          expired={expiredItemsCount}
        />

        {/* Main Content Layout */}
        <div className="space-y-8">
          {/* Smart Input + Add Items Manually Button stacked and centered */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full sm:w-2/3">
              <NaturalLanguageInput onItemsParsed={addItemsFromAI} />
            </div>
            <Button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 dark:from-[#34d399] dark:to-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Items Manually
            </Button>
          </div>
          <SmartQuery items={items} />
          <NotificationPanel items={expiringItems} />
          <ItemDashboard 
            items={items} 
            onRemoveItem={removeItem} 
            onEditItem={handleEditItem}
            userEmail={session.user.email || 'user@example.com'}
          />
          <RecipeRecommendations items={items} />
          {itemsLoading && (
            <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-background rounded-lg p-8 shadow-lg text-center text-lg dark:text-black">
                Loading your fridge items...
              </div>
            </div>
          )}
        </div>
        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-background rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <AddItemForm 
                onAddItem={addItem} 
                onCancel={() => setShowAddForm(false)} 
              />
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-background rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <AddItemForm 
                initialItem={editingItem}
                onAddItem={updateItem} 
                onCancel={() => setEditingItem(null)}
                isEditing={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
