import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, TrendingUp, Clock } from 'lucide-react';
import { FridgeItem } from '@/types/FridgeItem';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalyticsPanelProps {
  items: FridgeItem[];
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ items }) => {
  // Category distribution data
  const categoryStats = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    percentage: Math.round((count / items.length) * 100)
  }));

  // Status distribution data
  const statusStats = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusStats).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  // Days until expiry data
  const expiryData = items.map(item => {
    const today = new Date();
    const soonestExpiry = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
    const daysLeft = Math.ceil((soonestExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let category = 'Expired';
    if (daysLeft > 7) category = '7+ days';
    else if (daysLeft > 3) category = '4-7 days';
    else if (daysLeft > 0) category = '1-3 days';
    
    return { category, daysLeft, name: item.name };
  });

  const expiryStats = expiryData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const expiryChartData = Object.entries(expiryStats).map(([category, count]) => ({
    name: category,
    count
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#f97316', '#06b6d4', '#84cc16'];

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      dairy: '🥛',
      vegetables: '🥬',
      fruits: '🍎',
      meat: '🥩',
      seafood: '🐟',
      beverages: '🥤',
      condiments: '🍯',
      leftovers: '🍽️'
    };
    return emojiMap[category.toLowerCase()] || '📦';
  };

  if (items.length === 0) {
    return (
      <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No data to analyze</div>
          <div className="text-gray-500">Add some items to see analytics</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
      </div>

      <div className="space-y-8">
        {/* Category Distribution */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-2xl">{getCategoryEmoji(category.name)}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.value} items</Badge>
                    <span className="text-sm text-gray-500">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expiry Timeline */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-800">Expiry Timeline</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Overview */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Status Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusData.map((status) => (
              <Card key={status.name} className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">{status.value}</div>
                <div className="text-sm text-gray-600 capitalize">{status.name}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {Math.round((items.filter(item => item.status === 'fresh').length / items.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Fresh Items</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-amber-600">
              {categoryData.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {items.length > 0 ? Math.round(items.reduce((acc, item) => {
                const today = new Date();
                const expiry = new Date(Math.min(item.printedExpiry.getTime(), item.predictedExpiry.getTime()));
                return acc + Math.max(0, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
              }, 0) / items.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Days Left</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnalyticsPanel;
