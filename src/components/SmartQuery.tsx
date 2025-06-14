
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Loader2, Search } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { FridgeItem } from '@/types/FridgeItem';

interface SmartQueryProps {
  items: FridgeItem[];
}

const SmartQuery: React.FC<SmartQueryProps> = ({ items }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clear response when items change to reflect current state
  useEffect(() => {
    if (response) {
      setResponse('');
    }
  }, [items.length]); // Clear when items are added/removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    console.log('Processing query with current items:', items.map(item => `${item.name} (${item.status})`));
    
    setIsLoading(true);
    try {
      const aiResponse = await geminiService.processNaturalQuery(query, items);
      setResponse(aiResponse);
    } catch (error) {
      setResponse('Sorry, I could not process your question right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setQuery(question);
    
    console.log('Processing quick question with current items:', items.map(item => `${item.name} (${item.status})`));
    
    setIsLoading(true);
    try {
      const aiResponse = await geminiService.processNaturalQuery(question, items);
      setResponse(aiResponse);
    } catch (error) {
      setResponse('Sorry, I could not process your question right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What's expiring this week?",
    "What can I cook with these items?",
    "How much dairy do I have?",
    "Show me all vegetables"
  ];

  return (
    <Card className="p-4 bg-purple-50/50 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-purple-600" />
        <h3 className="font-medium text-purple-800">Ask about your fridge</h3>
        <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
          {items.length} items
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything about your fridge..."
            className="bg-white flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!query.trim() || isLoading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-1 mt-2">
        {quickQuestions.map((question, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2 text-purple-600 hover:bg-purple-100"
            onClick={() => handleQuickQuestion(question)}
            disabled={isLoading}
          >
            {question}
          </Button>
        ))}
      </div>

      {response && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
          <div className="text-sm text-gray-700">{response}</div>
        </div>
      )}

      {items.length === 0 && (
        <div className="mt-4 p-3 bg-purple-100 rounded-lg">
          <div className="text-xs text-purple-700">
            Add items to your fridge to start asking questions!
          </div>
        </div>
      )}
    </Card>
  );
};

export default SmartQuery;
