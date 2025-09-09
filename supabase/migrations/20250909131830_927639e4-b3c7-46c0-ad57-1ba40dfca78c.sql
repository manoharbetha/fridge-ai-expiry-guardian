-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_food_item_added ON public.food_items;

-- Create trigger that fires after insert on food_items
CREATE TRIGGER on_food_item_added
  AFTER INSERT ON public.food_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_expired_item();