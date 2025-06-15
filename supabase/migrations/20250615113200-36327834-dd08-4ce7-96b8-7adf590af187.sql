
-- Enable RLS for food_items table
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select their own items
CREATE POLICY "Users can view their own foods"
  ON public.food_items
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own items
CREATE POLICY "Users can insert their own foods"
  ON public.food_items
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own items
CREATE POLICY "Users can update their own foods"
  ON public.food_items
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own items
CREATE POLICY "Users can delete their own foods"
  ON public.food_items
  FOR DELETE
  USING (user_id = auth.uid());

-- Add missing fields if not present (custom expiry support)
DO $$
BEGIN
  -- If column open_date does not exist, add it (date food was opened)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='food_items' AND column_name='open_date'
  ) THEN
    ALTER TABLE public.food_items ADD COLUMN open_date date;
  END IF;

  -- If column predicted_expiry does not exist, add it (predicted by AI)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='food_items' AND column_name='predicted_expiry'
  ) THEN
    ALTER TABLE public.food_items ADD COLUMN predicted_expiry date;
  END IF;

  -- If column printed_expiry does not exist, add it (printed on package)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='food_items' AND column_name='printed_expiry'
  ) THEN
    ALTER TABLE public.food_items ADD COLUMN printed_expiry date;
  END IF;

  -- If column status does not exist, add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='food_items' AND column_name='status'
  ) THEN
    ALTER TABLE public.food_items ADD COLUMN status text;
  END IF;

  -- If column notification_sent does not exist, add it (for notifications)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='food_items' AND column_name='notification_sent'
  ) THEN
    ALTER TABLE public.food_items ADD COLUMN notification_sent boolean DEFAULT false;
  END IF;
END $$;
