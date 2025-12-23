-- Add quran_citations column to chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN quran_citations JSONB DEFAULT NULL;