
import React, { useEffect, useCallback, useRef } from 'react';
import { FridgeItem } from '@/types/FridgeItem';
import { Card3DList, CardData } from '@/components/ui/animated-3d-card';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { notifyExpiry } from '@/utils/webhooks';

interface ItemDashboardProps {
  items: FridgeItem[];
  onRemoveItem: (id: string) => void;
  onEditItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<FridgeItem>) => void;
  userEmail?: string;
}

const ItemDashboard: React.FC<ItemDashboardProps> = ({ 
  items, 
  onRemoveItem, 
  onEditItem,
  onUpdateItem,
  userEmail = 'user@example.com' 
}) => {
  const notifiedItemsRef = useRef<Set<string>>(new Set());

  // Check for expired items and send notifications
  const checkExpiredItems = useCallback(async () => {
    if (!items.length || !userEmail) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      const printedExpiry = new Date(item.printedExpiry);
      const predictedExpiry = new Date(item.predictedExpiry);
      const expiryDate = new Date(Math.min(printedExpiry.getTime(), predictedExpiry.getTime()));
      expiryDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if item is expired and notification hasn't been sent
      if (daysLeft <= 0 && !item.notificationSent && !notifiedItemsRef.current.has(item.id)) {
        console.log(`Sending notification for expired item: ${item.name}`);
        notifiedItemsRef.current.add(item.id);
        
        const success = await notifyExpiry({
          itemName: item.name,
          expiryDate: expiryDate.toISOString().split('T')[0],
          userEmail: userEmail
        });
        
        if (success) {
          console.log(`Successfully sent notification for ${item.name}`);
          // Update the item to mark notification as sent
          onUpdateItem(item.id, { notificationSent: true });
        }
      }
    }
  }, [items, userEmail, onUpdateItem]);

  useEffect(() => {
    checkExpiredItems();
  }, [checkExpiredItems]);
  const sortedItems = [...items].sort((a, b) => {
    const aExpiry = new Date(Math.min(a.printedExpiry.getTime(), a.predictedExpiry.getTime()));
    const bExpiry = new Date(Math.min(b.printedExpiry.getTime(), b.predictedExpiry.getTime()));
    return aExpiry.getTime() - bExpiry.getTime();
  });

  const getDaysUntilExpiry = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case 'dairy': return '🥛';
      case 'vegetables': return '🥬';
      case 'fruits': return '🍎';
      case 'meat': return '🥩';
      case 'seafood': return '🐟';
      case 'beverages': return '🥤';
      case 'condiments': return '🍯';
      case 'leftovers': return '🍽️';
      default: return '📦';
    }
  };

  const getThemeFromStatus = (status: string) => {
    switch (status) {
      case 'fresh': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      case 'expired': return 'danger';
      default: return 'primary';
    }
  };

  const cards: CardData[] = sortedItems.map(item => {
    const soonestExpiry = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
    const daysLeft = getDaysUntilExpiry(soonestExpiry);
    
    // Calculate status dynamically based on days left
    let calculatedStatus: string;
    if (daysLeft <= 0) {
      calculatedStatus = 'expired';
    } else if (daysLeft <= 2) {
      calculatedStatus = 'critical';
    } else if (daysLeft <= 5) {
      calculatedStatus = 'warning';
    } else {
      calculatedStatus = 'fresh';
    }
    
    const description = `${item.category} • ${daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
Printed: ${format(item.printedExpiry, 'MMM dd, yyyy')}
AI Predicted: ${format(item.predictedExpiry, 'MMM dd, yyyy')}`;

    return {
      id: item.id,
      title: item.name,
      description,
      icon: <span className="text-2xl">{getCategoryEmoji(item.category)}</span>,
      theme: getThemeFromStatus(calculatedStatus) as any,
      onDelete: () => onRemoveItem(item.id),
      onEdit: () => onEditItem(item.id)
    };
  });

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Fridge Items</h2>
      
      {sortedItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Your fridge is empty</div>
          <div className="text-gray-500">Add some items to start tracking expiry dates!</div>
        </div>
      ) : (
        <Card3DList
          cards={cards}
          columns={3}
          gap="lg"
          size="sm"
          variant="premium"
          animated={true}
        />
      )}
    </Card>
  );
};

export default React.memo(ItemDashboard);
