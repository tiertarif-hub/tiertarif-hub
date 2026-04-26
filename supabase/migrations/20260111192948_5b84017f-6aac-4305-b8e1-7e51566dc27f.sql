-- Remove the public insert policy on subscribers table
-- This forces all subscriptions through the Edge Function which has rate limiting
DROP POLICY IF EXISTS "Anyone can subscribe with valid email" ON public.subscribers;