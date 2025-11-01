import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  MessageSquare,
  Archive,
  Trash2,
  Edit2,
  Check,
  X,
  Menu,
  MoreVertical,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  title: string;
  is_archived: boolean;
  updated_at: string;
}

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  userId: string;
  refreshTrigger?: number;
}

const ConversationSidebar = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  userId,
  refreshTrigger,
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, [userId, refreshTrigger]);

  const loadConversations = async () => {
    const { data: active, error: activeError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });

    const { data: archived, error: archivedError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", true)
      .order("updated_at", { ascending: false });

    if (activeError || archivedError) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      return;
    }

    setConversations(active || []);
    setArchivedConversations(archived || []);
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;

    const { error } = await supabase
      .from("conversations")
      .update({ title: editTitle })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to rename conversation",
        variant: "destructive",
      });
      return;
    }

    loadConversations();
    setEditingId(null);
    setEditTitle("");
  };

  const handleArchive = async (id: string, archive: boolean) => {
    const { error } = await supabase
      .from("conversations")
      .update({ is_archived: archive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${archive ? "archive" : "unarchive"} conversation`,
        variant: "destructive",
      });
      return;
    }

    loadConversations();
    if (currentConversationId === id && archive) {
      onNewConversation();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      return;
    }

    loadConversations();
    if (currentConversationId === id) {
      onNewConversation();
    }
  };

  const ConversationItem = ({ conv }: { conv: Conversation }) => (
    <div
      className={`group flex items-center gap-2 p-3 rounded-lg transition-all relative ${
        currentConversationId === conv.id
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/20"
      }`}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0" />
      
      {editingId === conv.id ? (
        <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename(conv.id);
              if (e.key === "Escape") {
                setEditingId(null);
                setEditTitle("");
              }
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => handleRename(conv.id)}
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => {
              setEditingId(null);
              setEditTitle("");
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <>
          <span 
            className="flex-1 text-sm truncate cursor-pointer"
            onClick={() => onSelectConversation(conv.id)}
          >
            {conv.title}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:bg-accent/50"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingId(conv.id);
                    setEditTitle(conv.title);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleArchive(conv.id, !conv.is_archived)}>
                  <Archive className="w-4 h-4 mr-2" />
                  {conv.is_archived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(conv.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <div className="w-14 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="w-10 h-10 p-0"
          onClick={() => setCollapsed(false)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="w-10 h-10 p-0"
          onClick={onNewConversation}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Conversations</h2>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setCollapsed(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
        <Button
          className="w-full justify-start gap-2 transition-all duration-300 hover:scale-105"
          onClick={onNewConversation}
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {conversations
            .filter((conv) =>
              conv.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((conv) => (
              <ConversationItem key={conv.id} conv={conv} />
            ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 transition-all hover:scale-105"
          onClick={() => setShowArchive(!showArchive)}
        >
          <Archive className="w-4 h-4" />
          Archived ({archivedConversations.length})
        </Button>

        {showArchive && archivedConversations.length > 0 && (
          <ScrollArea className="max-h-48 mt-2">
            <div className="space-y-1">
              {archivedConversations.map((conv) => (
                <ConversationItem key={conv.id} conv={conv} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;