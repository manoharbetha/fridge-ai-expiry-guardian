
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const warningItems = items.filter(item => item.status === 'warning' || item.status === 'critical');

  const loadRecipes = async () => {
    if (warningItems.length === 0) return;

    setIsLoading(true);
    try {
      const itemNames = warningItems.map(item => item.name);
      const recommendations = await geminiService.getRecipeRecommendations(itemNames);
      setRecipes(recommendations);
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (warningItems.length > 0 && !hasLoaded) {
      loadRecipes();
    }
  }, [warningItems.length]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (warningItems.length === 0) {
    return (
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Recipe Suggestions</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No expiring items</div>
          <div className="text-gray-500 text-sm">Recipe suggestions will appear when you have items expiring soon</div>
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
        {hasLoaded && (
          <Button
            onClick={loadRecipes}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        )}
      </div>

      {isLoading && !hasLoaded ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <div className="text-gray-600">Getting personalized recipes...</div>
        </div>
      ) : recipes.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg mb-4">
            🍳 Using: {warningItems.map(item => item.name).join(', ')}
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
                  Waste-reducing
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
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No recipes found</div>
          <Button onClick={loadRecipes} variant="outline">
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RecipeRecommendations;
