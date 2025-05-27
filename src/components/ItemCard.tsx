
import React from 'react';
import { FridgeItem } from '@/types/FridgeItem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ItemCardProps {
  item: FridgeItem;
  onRemove: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onRemove }) => {
  const getDaysUntilExpiry = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const soonestExpiry = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
  const daysLeft = getDaysUntilExpiry(soonestExpiry);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 bg-white border-l-4 border-l-green-400">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{item.category}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-3">
            <Badge className={`${getStatusColor(item.status)} border`}>
              {item.status === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
            
            <div className="text-sm text-gray-600">
              {daysLeft > 0 ? (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {daysLeft} days left
                </span>
              ) : (
                <span className="text-red-600 font-medium">Expired</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Printed Expiry:</span>
              <br />
              {format(item.printedExpiry, 'MMM dd, yyyy')}
            </div>
            <div>
              <span className="font-medium">AI Predicted:</span>
              <br />
              {format(item.predictedExpiry, 'MMM dd, yyyy')}
            </div>
          </div>
        </div>

        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ItemCard;
