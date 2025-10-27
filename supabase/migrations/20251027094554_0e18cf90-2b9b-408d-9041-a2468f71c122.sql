-- Fix security warning: Set search_path on function
DROP FUNCTION IF EXISTS public.update_conversation_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();