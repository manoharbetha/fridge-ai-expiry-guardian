
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Refrigerator, Trash2, LogOut } from 'lucide-react';

interface HeaderBarProps {
  email: string;
  expiredItemsCount: number;
  onPurgeExpired: () => void;
  onAddItem: () => void;
  onLogout: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  email,
  expiredItemsCount,
  onPurgeExpired,
  // onAddItem, // Removed the add item button from the header
  onLogout
}) => (
  <div className="flex items-center justify-between mb-8">
    {/* Branding */}
    <div className="flex items-center gap-3">
      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-[#34d399] dark:to-green-700 rounded-xl shadow-lg">
        <Refrigerator className="w-8 h-8 text-white dark:text-black" />
      </div>
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent dark:from-teal-200 dark:to-green-300 dark:bg-clip-text dark:text-black">
          Smart Fridge Manager
        </h1>
        <p className="text-gray-600 dark:text-black">AI-powered expiry tracking and waste reduction</p>
      </div>
    </div>
    {/* Actions */}
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium text-gray-700 dark:text-black">{email}</p>
        <p className="text-xs text-gray-500 dark:text-black">Welcome!</p>
      </div>
      {expiredItemsCount > 0 && (
        <Button
          onClick={onPurgeExpired}
          variant="destructive"
          className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-700 bg-red-700 text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Purge All Expired
        </Button>
      )}
      {/* Removed ADD ITEM Button */}
      <Button
        variant="outline"
        onClick={onLogout}
        className="shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  </div>
);

export default HeaderBar;

