
import React, { useState } from 'react';
import { FridgeItem } from '@/types/FridgeItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddItemFormProps {
  onAddItem: (item: Omit<FridgeItem, 'id' | 'status'>) => void;
  onCancel: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, onCancel }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [openDate, setOpenDate] = useState<Date>(new Date());
  const [printedExpiry, setPrintedExpiry] = useState<Date>();

  const categories = [
    'dairy', 'vegetables', 'fruits', 'meat', 'seafood', 
    'beverages', 'condiments', 'leftovers', 'frozen', 'other'
  ];

  // Mock AI prediction function
  const predictExpiry = (category: string, openDate: Date, printedExpiry?: Date) => {
    const baselineHours = {
      dairy: 5 * 24,
      vegetables: 7 * 24,
      fruits: 5 * 24,
      meat: 3 * 24,
      seafood: 2 * 24,
      beverages: 30 * 24,
      condiments: 60 * 24,
      leftovers: 3 * 24,
      frozen: 90 * 24,
      other: 7 * 24
    };

    const baseHours = baselineHours[category as keyof typeof baselineHours] || 7 * 24;
    // Add some randomness to simulate AI prediction
    const variationHours = (Math.random() - 0.5) * 48;
    const predictedHours = baseHours + variationHours;
    
    return new Date(openDate.getTime() + predictedHours * 60 * 60 * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !printedExpiry) return;

    const predictedExpiry = predictExpiry(category, openDate, printedExpiry);

    const newItem: Omit<FridgeItem, 'id' | 'status'> = {
      name,
      category,
      openDate,
      printedExpiry,
      predictedExpiry,
      notificationSent: false
    };

    onAddItem(newItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Add New Item</h2>
        <Button onClick={onCancel} variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Organic Milk"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Date Opened</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !openDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {openDate ? format(openDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={openDate}
                onSelect={setOpenDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Printed Expiry Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !printedExpiry && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {printedExpiry ? format(printedExpiry, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={printedExpiry}
                onSelect={setPrintedExpiry}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          disabled={!name || !category || !printedExpiry}
        >
          Add Item
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddItemForm;
