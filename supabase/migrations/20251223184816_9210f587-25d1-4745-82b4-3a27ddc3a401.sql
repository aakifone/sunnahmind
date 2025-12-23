-- Add sort_order column to conversations table for drag-and-drop reordering
ALTER TABLE public.conversations 
ADD COLUMN sort_order INTEGER DEFAULT 0;