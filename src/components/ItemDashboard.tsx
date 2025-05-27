
import React from 'react';
import { FridgeItem } from '@/types/FridgeItem';
import ItemCard from './ItemCard';
import { Card } from '@/components/ui/card';

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

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Fridge Items</h2>
      
      {sortedItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Your fridge is empty</div>
          <div className="text-gray-500">Add some items to start tracking expiry dates!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onRemove={() => onRemoveItem(item.id)} 
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default ItemDashboard;
