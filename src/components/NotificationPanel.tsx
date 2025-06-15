import React from 'react';
import { FridgeItem } from '@/types/FridgeItem';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  items: FridgeItem[];
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ items }) => {
  const criticalItems = items.filter(item => item.status === 'critical');
  const warningItems = items.filter(item => item.status === 'warning');

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-amber-600" />
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
      </div>

      <div className="space-y-4">
        {criticalItems.length === 0 && warningItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">All good!</div>
            <div className="text-gray-500 text-sm">No items expiring soon</div>
          </div>
        ) : (
          <>
            {criticalItems.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-red-800">{item.name}</div>
                  <div className="text-sm text-red-600">
                    Expires {formatDistanceToNow(new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime())), { addSuffix: true })}
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs mt-1 transition-colors hover:bg-red-200">
                    Critical
                  </Badge>
                </div>
              </div>
            ))}

            {warningItems.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-amber-800">{item.name}</div>
                  <div className="text-sm text-amber-600">
                    Expires {formatDistanceToNow(new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime())), { addSuffix: true })}
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs mt-1 transition-colors hover:bg-amber-200">
                    Warning
                  </Badge>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            💡 Pro tip: Use items in order of predicted expiry to minimize waste
          </div>
        </div>
      )}
    </Card>
  );
};

export default NotificationPanel;
