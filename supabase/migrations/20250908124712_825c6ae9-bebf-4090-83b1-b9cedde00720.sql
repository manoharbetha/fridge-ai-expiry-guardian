-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs every hour to check for expired items
SELECT cron.schedule(
  'check-expired-items',
  '0 * * * *', -- every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://nmrxhlcxklynfqjjmzfz.supabase.co/functions/v1/check-expired-items',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcnhobGN4a2x5bmZxamptemt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDAzNTIsImV4cCI6MjA0MDE3NjM1Mn0.CnYZCRibH7CwqOw6lJ6XNMWdpCPqL5w8eeFHWUIjfbA"}'::jsonb,
        body:='{"source": "cron_job"}'::jsonb
    ) as request_id;
  $$
);