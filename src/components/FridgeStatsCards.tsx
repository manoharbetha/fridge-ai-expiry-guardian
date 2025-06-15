
import React from 'react';
import { Card } from '@/components/ui/card';

interface Stats {
  total: number;
  expiring: number;
  fresh: number;
  expired: number;
}

const FridgeStatsCards: React.FC<Stats> = ({ total, expiring, fresh, expired }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <Card className="p-6 bg-white/80 dark:bg-[#112417]/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="text-center">
        <div className="text-3xl font-bold text-green-600 dark:text-black">{total}</div>
        <div className="text-gray-600 dark:text-black">Total Items</div>
      </div>
    </Card>
    <Card className="p-6 bg-white/80 dark:bg-[#16291f]/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="text-center">
        <div className="text-3xl font-bold text-amber-600 dark:text-black">{expiring}</div>
        <div className="text-gray-600 dark:text-black">Expiring Soon</div>
      </div>
    </Card>
    <Card className="p-6 bg-white/80 dark:bg-[#16312c]/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 dark:text-black">{fresh}</div>
        <div className="text-gray-600 dark:text-black">Fresh Items</div>
      </div>
    </Card>
    <Card className="p-6 bg-white/80 dark:bg-[#1d2429]/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="text-center">
        <div className="text-3xl font-bold text-red-600 dark:text-black">{expired}</div>
        <div className="text-gray-600 dark:text-black">Expired Items</div>
      </div>
    </Card>
  </div>
);

export default FridgeStatsCards;
