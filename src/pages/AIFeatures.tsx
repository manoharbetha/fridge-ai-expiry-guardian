
import React from 'react';
import SmartQuery from '@/components/SmartQuery';
import RecipeRecommendations from '@/components/RecipeRecommendations';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { FridgeItem } from '@/types/FridgeItem';
import { Card } from '@/components/ui/card';
import { Brain, ChefHat, BarChart3 } from 'lucide-react';

interface AIFeaturesProps {
  items: FridgeItem[];
}

const AIFeatures: React.FC<AIFeaturesProps> = ({ items }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
            AI Features & Analytics
          </h1>
          <p className="text-gray-600">Smart insights and recommendations for your fridge</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-purple-800">Smart Query</h3>
          </div>
          <p className="text-sm text-purple-700">Ask natural language questions about your fridge contents</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <ChefHat className="w-6 h-6 text-emerald-600" />
            <h3 className="font-semibold text-emerald-800">Recipe AI</h3>
          </div>
          <p className="text-sm text-emerald-700">Get personalized recipe suggestions based on your ingredients</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Analytics</h3>
          </div>
          <p className="text-sm text-blue-700">Visual insights into your fridge inventory and patterns</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Features */}
        <div className="space-y-6">
          <SmartQuery items={items} />
          <RecipeRecommendations items={items} />
        </div>

        {/* Analytics */}
        <div>
          <AnalyticsPanel items={items} />
        </div>
      </div>
    </div>
  );
};

export default AIFeatures;
