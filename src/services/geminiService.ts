
const GEMINI_API_KEY = 'AIzaSyC30AJocdU8MIC6guSg5SkUOZ2V7dMAijk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ParsedFoodItem {
  name: string;
  category: string;
  quantity?: string;
  confidence: number;
}

export interface RecipeRecommendation {
  title: string;
  description: string;
  ingredients: string[];
  cookingTime: string;
  difficulty: string;
}

export class GeminiService {
  private async makeRequest(prompt: string): Promise<string> {
    console.log('Making Gemini API request with prompt:', prompt.substring(0, 100) + '...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', data);
    
    const responseText = data.candidates[0]?.content?.parts[0]?.text || '';
    console.log('Extracted response text:', responseText);
    
    return responseText;
  }

  async parseNaturalLanguageInput(input: string): Promise<ParsedFoodItem[]> {
    const prompt = `
    Parse the following text and extract food items with their categories. Return ONLY a JSON array with this exact format:
    [{"name": "item_name", "category": "category", "quantity": "optional_quantity", "confidence": 0.9}]
    
    Categories must be one of: dairy, vegetables, fruits, meat, seafood, beverages, condiments, leftovers
    
    Text to parse: "${input}"
    
    Examples:
    "I bought 2 apples and some milk" -> [{"name": "apples", "category": "fruits", "quantity": "2", "confidence": 0.95}, {"name": "milk", "category": "dairy", "confidence": 0.9}]
    `;

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed food items:', parsed);
        return parsed;
      }
      console.log('No JSON found in response, returning empty array');
      return [];
    } catch (error) {
      console.error('Error parsing natural language:', error);
      return [];
    }
  }

  async getRecipeRecommendations(expiringItems: string[]): Promise<RecipeRecommendation[]> {
    const itemsList = expiringItems.join(', ');
    const prompt = `
    Given these food items: ${itemsList}
    
    Suggest 3 recipes that use these ingredients. Return ONLY a JSON array with this exact format:
    [{"title": "Recipe Name", "description": "Brief description", "ingredients": ["ingredient1", "ingredient2"], "cookingTime": "time", "difficulty": "easy/medium/hard"}]
    
    Focus on:
    - Quick recipes (under 30 minutes when possible)
    - Using the provided ingredients as main components
    - Simple, accessible recipes
    `;

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed recipes:', parsed);
        return parsed;
      }
      console.log('No JSON found in recipe response, returning empty array');
      return [];
    } catch (error) {
      console.error('Error getting recipe recommendations:', error);
      return [];
    }
  }

  async processNaturalQuery(query: string, items: any[]): Promise<string> {
    const itemsList = items.map(item => {
      const status = item.status === 'critical' ? '(expiring soon!)' : 
                   item.status === 'warning' ? '(expiring this week)' : '(fresh)';
      return `${item.name} ${status}`;
    }).join(', ');
    
    const prompt = `
    You are a smart fridge assistant. The user has these ${items.length} items in their fridge: ${itemsList || 'No items currently'}
    
    User query: "${query}"
    
    Provide a helpful, conversational response about their fridge contents. Be specific and mention actual items they have. Be concise and friendly.
    `;

    try {
      const response = await this.makeRequest(prompt);
      console.log('Natural query response:', response);
      return response;
    } catch (error) {
      console.error('Error processing natural query:', error);
      return 'Sorry, I could not process your request right now.';
    }
  }
}

export const geminiService = new GeminiService();
