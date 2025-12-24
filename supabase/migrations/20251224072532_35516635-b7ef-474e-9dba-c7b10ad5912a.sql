-- Add deleted_at column for soft delete (15-day auto-removal)
ALTER TABLE public.conversations 
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient querying of non-deleted conversations
CREATE INDEX idx_conversations_deleted_at ON public.conversations(deleted_at) WHERE deleted_at IS NOT NULL;