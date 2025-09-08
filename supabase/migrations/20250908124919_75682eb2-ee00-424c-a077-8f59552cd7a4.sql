-- Create a trigger function to handle expired items being added
CREATE OR REPLACE FUNCTION public.handle_expired_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  
AS $function$
DECLARE
  expiry_date date;
  days_left integer;
BEGIN
  -- Calculate the earliest expiry date
  expiry_date := LEAST(NEW.printed_expiry, NEW.predicted_expiry);
  days_left := expiry_date - CURRENT_DATE;
  
  -- If item is expired and notification not sent, trigger edge function
  IF days_left <= 0 AND NEW.notification_sent = false THEN
    -- Use pg_net to call the edge function asynchronously
    PERFORM net.http_post(
      url := 'https://nmrxhlcxklynfqjjmzfz.supabase.co/functions/v1/check-expired-items',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcnhobGN4a2x5bmZxamptemt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDAzNTIsImV4cCI6MjA0MDE3NjM1Mn0.CnYZCRibH7CwqOw6lJ6XNMWdpCPqL5w8eeFHWUIjfbA"}'::jsonb,
      body := '{"source": "database_trigger", "item_id": "' || NEW.id || '"}'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger that fires after insert on food_items
CREATE TRIGGER on_food_item_added
  AFTER INSERT ON public.food_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_expired_item();