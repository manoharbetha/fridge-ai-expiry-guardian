
import React, { useState, useRef } from "react";
import { FridgeItem } from "@/types/FridgeItem";
import { Button } from "@/components/ui/button";
import { ChefHat, Loader2 } from "lucide-react";

interface RecipeDragDropProps {
  items: FridgeItem[];
  onGetRecipes: (selectedIds: string[]) => Promise<void>;
  isLoading: boolean;
}

const RecipeDragDrop: React.FC<RecipeDragDropProps> = ({
  items,
  onGetRecipes,
  isLoading,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // separate unselected and selected
  const unselectedItems = items.filter((item) => !selected.includes(item.id));
  const selectedItems = items.filter((item) => selected.includes(item.id));

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd = () => setDraggedId(null);

  const handleDropToSelected = (id: string) => {
    if (!selected.includes(id)) setSelected((s) => [...s, id]);
    setDraggedId(null);
  };

  const handleDropToUnselected = (id: string) => {
    setSelected((s) => s.filter((_id) => _id !== id));
    setDraggedId(null);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Unselected/Available Items */}
      <div
        className="bg-gray-50 rounded-xl p-4 min-h-[140px] shadow"
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          const id = e.dataTransfer.getData("text/plain");
          // Only drop back if in selected
          if (selected.includes(id)) handleDropToUnselected(id);
        }}
      >
        <div className="font-semibold mb-2 text-gray-700 text-sm">All Fridge Items</div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {unselectedItems.length === 0 ? (
            <div className="text-gray-400 text-xs italic">All items selected</div>
          ) : unselectedItems.map((item) => (
            <div
              key={item.id}
              className={`inline-flex items-center space-x-1 px-2 py-1 bg-white rounded shadow border border-gray-200 cursor-move
                ${draggedId === item.id ? "opacity-50" : ""}
                hover:bg-emerald-50 transition-colors`}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={() => handleDragEnd()}
              onDoubleClick={() => handleDropToSelected(item.id)}
              title="Drag or double-click to select"
            >
              <span className="text-lg">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Items For Recipes */}
      <div
        className="bg-green-50 rounded-xl p-4 min-h-[140px] shadow"
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          const id = e.dataTransfer.getData("text/plain");
          // Only drop if not already selected
          if (!selected.includes(id) && items.find(i => i.id === id)) {
            handleDropToSelected(id);
          }
        }}
      >
        <div className="font-semibold mb-2 text-green-800 text-sm flex items-center gap-1">
          <ChefHat className="w-4 h-4 text-green-500" /> Selected for Recipes
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {selectedItems.length === 0 ? (
            <div className="text-gray-400 text-xs italic">Drag items here!</div>
          ) : selectedItems.map((item) => (
            <div
              key={item.id}
              className={`inline-flex items-center space-x-1 px-2 py-1 bg-white rounded shadow border border-green-200 cursor-move
                ${draggedId === item.id ? "opacity-50" : ""}
                hover:bg-green-100 transition-colors`}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={() => handleDragEnd()}
              onDoubleClick={() => handleDropToUnselected(item.id)}
              title="Drag or double-click to remove"
            >
              <span className="text-lg">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            disabled={selectedItems.length === 0 || isLoading}
            onClick={() => onGetRecipes(selected)}
            variant="outline"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Recipes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDragDrop;

