
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { geminiService, RecipeRecommendation } from '@/services/geminiService';
import { FridgeItem } from '@/types/FridgeItem';
import RecipeDragDrop from "./RecipeDragDrop";

interface RecipeRecommendationsProps {
  items: FridgeItem[];
}

const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({ items }) => {
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Handler for drag & drop component
  const handleGetRecipes = async (ids: string[]) => {
    const selectedItems = items.filter(item => ids.includes(item.id));
    setSelectedIds(ids);
    if (selectedItems.length === 0) {
      setRecipes([]);
      return;
    }
    setIsLoading(true);
    try {
      const itemNames = selectedItems.map(item => item.name);
      const recs = await geminiService.getRecipeRecommendations(itemNames);
      setRecipes(recs);
    } catch {
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedItems = items.filter(item => selectedIds.includes(item.id));

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="mb-6">
        <RecipeDragDrop items={items} onGetRecipes={handleGetRecipes} isLoading={isLoading} />
      </div>
      {isLoading ? (
        <div className="text-center py-8">
          <span className="text-gray-600">Getting personalized recipes...</span>
        </div>
      ) : recipes.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg mb-4">
            🍳 Using: {selectedItems.map(item => item.name).join(', ')}
          </div>
          {recipes.map((recipe, idx) => (
            <Card key={idx} className="p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="mb-3">
                <h3 className="font-semibold text-lg text-gray-800">{recipe.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>
              <div className="text-xs">Ingredients: {recipe.ingredients.join(", ")}</div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          {selectedIds.length === 0
            ? "Select or drag items for recipe suggestions"
            : "No recipe suggestions yet. Try with different items!"}
        </div>
      )}
    </Card>
  );
};

export default RecipeRecommendations;

