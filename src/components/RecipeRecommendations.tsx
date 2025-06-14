
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChefHat, Clock, Loader2, Star } from 'lucide-react';
import { geminiService, RecipeRecommendation } from '@/services/geminiService';
import { FridgeItem } from '@/types/FridgeItem';

interface RecipeRecommendationsProps {
  items: FridgeItem[];
}

const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({ items }) => {
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Initialize all items as selected
  useEffect(() => {
    if (items.length > 0 && selectedItems.length === 0) {
      setSelectedItems(items.map(item => item.id));
    }
  }, [items]);

  // Update selected items when items change (remove deleted items)
  useEffect(() => {
    const currentItemIds = items.map(item => item.id);
    setSelectedItems(prev => prev.filter(id => currentItemIds.includes(id)));
  }, [items]);

  const loadRecipes = async () => {
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    if (selectedItemsData.length === 0) return;

    setIsLoading(true);
    try {
      const itemNames = selectedItemsData.map(item => item.name);
      const recommendations = await geminiService.getRecipeRecommendations(itemNames);
      setRecipes(recommendations);
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));

  if (items.length === 0) {
    return (
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Recipe Suggestions</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No items in fridge</div>
          <div className="text-gray-500 text-sm">Add some items to get recipe suggestions</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Recipe Suggestions</h2>
        </div>
        {selectedItems.length > 0 && (
          <Button
            onClick={loadRecipes}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Recipes'}
          </Button>
        )}
      </div>

      {/* Item Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select items for recipes:</h3>
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => handleItemToggle(item.id)}
              />
              <label
                htmlFor={item.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {item.name}
                {item.status === 'critical' && <span className="text-red-500 ml-1">⚠️</span>}
                {item.status === 'warning' && <span className="text-amber-500 ml-1">⚡</span>}
              </label>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {selectedItems.length} of {items.length} items selected
        </div>
      </div>

      {isLoading && !hasLoaded ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <div className="text-gray-600">Getting personalized recipes...</div>
        </div>
      ) : recipes.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg mb-4">
            🍳 Using: {selectedItemsData.map(item => item.name).join(', ')}
          </div>
          
          {recipes.map((recipe, index) => (
            <Card key={index} className="p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-800">{recipe.title}</h3>
                <div className="flex gap-2">
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {recipe.cookingTime}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  AI Recommended
                </div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Key Ingredients:</div>
                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.slice(0, 4).map((ingredient, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                  {recipe.ingredients.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.ingredients.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : selectedItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No items selected</div>
          <div className="text-gray-500 text-sm">Select items above to get recipe suggestions</div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">Ready for recipes!</div>
          <Button onClick={loadRecipes} variant="outline">
            Get Recipe Suggestions
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RecipeRecommendations;
