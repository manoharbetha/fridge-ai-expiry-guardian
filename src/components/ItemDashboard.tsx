
import React from 'react';
import { FridgeItem } from '@/types/FridgeItem';
import { Card3DList, CardData } from '@/components/ui/animated-3d-card';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ItemDashboardProps {
  items: FridgeItem[];
  onRemoveItem: (id: string) => void;
}

const ItemDashboard: React.FC<ItemDashboardProps> = ({ items, onRemoveItem }) => {
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
      onDelete: () => onRemoveItem(item.id)
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

export default ItemDashboard;
