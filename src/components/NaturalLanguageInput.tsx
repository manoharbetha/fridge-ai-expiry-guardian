import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, MessageSquare, Plus } from 'lucide-react';
import { geminiService, ParsedFoodItem } from '@/services/geminiService';
import { toast } from 'sonner';
interface NaturalLanguageInputProps {
  onItemsParsed: (items: ParsedFoodItem[]) => void;
}
const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  onItemsParsed
}) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const parsedItems = await geminiService.parseNaturalLanguageInput(input);
      if (parsedItems.length > 0) {
        onItemsParsed(parsedItems);
        toast.success(`Found ${parsedItems.length} item(s) from your message!`);
        setInput('');
      } else {
        toast.error('Could not find any food items in your message. Try being more specific.');
      }
    } catch (error) {
      toast.error('Failed to process your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  return <Card className="p-4 bg-blue-50/50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        <h3 className="font-medium text-blue-800 text-2xl">Smart Input</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Try: 'I just bought 2 apples, some milk, and chicken breast'" className="bg-white" disabled={isProcessing} />
        
        <Button type="submit" disabled={!input.trim() || isProcessing} className="w-full bg-blue-600 hover:bg-blue-700">
          {isProcessing ? <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </> : <>
              <Plus className="w-4 h-4 mr-2" />
              Add Items with AI
            </>}
        </Button>
      </form>
      
      <p className="text-xs text-blue-600 mt-2">
        💡 Describe what you bought naturally and AI will extract the items for you!
      </p>
    </Card>;
};
export default NaturalLanguageInput;