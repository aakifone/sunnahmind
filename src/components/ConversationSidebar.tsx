import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Archive,
  Trash2,
  Menu,
  Search,
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SwipeableConversationItem from "./SwipeableConversationItem";
import MushafIcon from "./icons/MushafIcon";
import { useIsMobile } from "@/hooks/use-mobile";

interface Conversation {
  id: string;
  title: string;
  is_archived: boolean;
  deleted_at?: string | null;
  updated_at: string;
  sort_order?: number;
}

import { SavedHadith } from "@/types/commands";
import FavoritesSection from "@/components/commands/FavoritesSection";

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  userId: string;
  refreshTrigger?: number;
  favorites?: SavedHadith[];
  onRemoveFavorite?: (id: string) => void;
  onSelectFavorite?: (hadith: SavedHadith) => void;
}

// Sortable wrapper component
const SortableItem = ({
  conv,
  currentConversationId,
  onSelectConversation,
  onArchive,
  onDelete,
  onRestore,
  onRename,
  onStartEdit,
  isMobile,
}: {
  conv: Conversation;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onStartEdit: (id: string) => void;
  isMobile: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: conv.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SwipeableConversationItem
        conv={conv}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
        onArchive={onArchive}
        onDelete={onDelete}
        onRestore={onRestore}
        onRename={onRename}
        onStartEdit={onStartEdit}
        isDraggable={!isMobile}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

// Drag overlay item
const DragOverlayItem = ({ conv }: { conv: Conversation }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-accent shadow-xl">
    <GripVertical className="w-4 h-4 text-muted-foreground" />
    <MushafIcon className="w-4 h-4" size={16} />
    <span className="text-sm truncate">{conv.title}</span>
  </div>
);

const ConversationSidebar = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  userId,
  refreshTrigger,
  favorites = [],
  onRemoveFavorite,
  onSelectFavorite,
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadConversations();
  }, [userId, refreshTrigger]);

  const loadConversations = async () => {
    // Active conversations (not archived, not deleted)
    const { data: active, error: activeError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    // Archived conversations (archived, not deleted)
    const { data: archived, error: archivedError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", true)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    // Deleted conversations (soft deleted)
    const { data: deleted, error: deletedError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (activeError || archivedError || deletedError) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      return;
    }

    setConversations(active || []);
    setArchivedConversations(archived || []);
    setDeletedConversations(deleted || []);
  };

  const handleRename = async (id: string, newTitle: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ title: newTitle })
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
  };

  const handleArchive = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ is_archived: true, deleted_at: null })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to archive conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Archived",
      description: "Conversation moved to archive",
    });

    loadConversations();
    if (currentConversationId === id) {
      onNewConversation();
    }
  };

  const handleSoftDelete = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ deleted_at: new Date().toISOString(), is_archived: false })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deleted",
      description: "Conversation will be permanently deleted in 15 days",
    });

    loadConversations();
    if (currentConversationId === id) {
      onNewConversation();
    }
  };

  const handleRestore = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ deleted_at: null, is_archived: false })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to restore conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Restored",
      description: "Conversation restored to active",
    });

    loadConversations();
  };

  const handlePermanentDelete = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to permanently delete conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Permanently Deleted",
      description: "Conversation has been permanently removed",
    });

    loadConversations();
    setPermanentDeleteId(null);
    if (currentConversationId === id) {
      onNewConversation();
    }
  };

  const updateSortOrder = async (reorderedConversations: Conversation[]) => {
    const updates = reorderedConversations.map((conv, index) => ({
      id: conv.id,
      sort_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from("conversations")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = conversations.findIndex((conv) => conv.id === active.id);
    const newIndex = conversations.findIndex((conv) => conv.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(conversations, oldIndex, newIndex);
      setConversations(reordered);
      await updateSortOrder(reordered);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Favorites Section - Right under New Conversation */}
        {favorites.length > 0 && onRemoveFavorite && onSelectFavorite && (
          <FavoritesSection
            favorites={favorites}
            onRemove={onRemoveFavorite}
            onSelect={onSelectFavorite}
            isExpanded={showFavorites}
            onToggle={() => setShowFavorites(!showFavorites)}
          />
        )}
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Instructions hint */}
        <div className="mt-3 text-xs text-muted-foreground">
          {isMobile ? (
            <p>← Swipe left for actions</p>
          ) : (
            <p>Right-click for options • Drag to reorder</p>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1 p-2">
          <SortableContext
            items={filteredConversations.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <SortableItem
                  key={conv.id}
                  conv={conv}
                  currentConversationId={currentConversationId}
                  onSelectConversation={onSelectConversation}
                  onArchive={handleArchive}
                  onDelete={handleSoftDelete}
                  onRestore={handleRestore}
                  onRename={handleRename}
                  onStartEdit={() => {}}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </SortableContext>
        </ScrollArea>

        <DragOverlay>
          {activeConversation ? <DragOverlayItem conv={activeConversation} /> : null}
        </DragOverlay>
      </DndContext>

      <Separator />

      <div className="p-4 space-y-2">
        {/* Archive Section */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 transition-all hover:scale-105"
          onClick={() => setShowArchive(!showArchive)}
        >
          <Archive className="w-4 h-4" />
          Archived ({archivedConversations.length})
        </Button>

        {showArchive && archivedConversations.length > 0 && (
          <ScrollArea className="max-h-48">
            <div className="space-y-1 pl-2">
              {archivedConversations.map((conv) => (
                <SwipeableConversationItem
                  key={conv.id}
                  conv={conv}
                  currentConversationId={currentConversationId}
                  onSelectConversation={onSelectConversation}
                  onArchive={handleArchive}
                  onDelete={handleSoftDelete}
                  onRestore={handleRestore}
                  onRename={handleRename}
                  onStartEdit={() => {}}
                  isArchived
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Deleted Section */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 transition-all hover:scale-105 text-destructive hover:text-destructive"
          onClick={() => setShowDeleted(!showDeleted)}
        >
          <Trash2 className="w-4 h-4" />
          Recently Deleted ({deletedConversations.length})
        </Button>

        {showDeleted && deletedConversations.length > 0 && (
          <ScrollArea className="max-h-48">
            <div className="space-y-1 pl-2">
              {deletedConversations.map((conv) => (
                <div key={conv.id} className="space-y-1">
                  <SwipeableConversationItem
                    conv={conv}
                    currentConversationId={currentConversationId}
                    onSelectConversation={onSelectConversation}
                    onArchive={handleArchive}
                    onDelete={() => {}}
                    onRestore={handleRestore}
                    onRename={handleRename}
                    onStartEdit={() => {}}
                    onPermanentDelete={(id) => setPermanentDeleteId(id)}
                    isDeleted
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs h-7"
                    onClick={() => setPermanentDeleteId(conv.id)}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Delete Permanently
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={!!permanentDeleteId} onOpenChange={() => setPermanentDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Permanently Delete Conversation?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This conversation and all its messages will be permanently removed from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => permanentDeleteId && handlePermanentDelete(permanentDeleteId)}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationSidebar;
