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
  Search,
  MoreVertical,
  GripVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Conversation {
  id: string;
  title: string;
  is_archived: boolean;
  updated_at: string;
  sort_order?: number;
}

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  userId: string;
  refreshTrigger?: number;
}

// Droppable archive zone component
const ArchiveDropZone = ({ isOver }: { isOver: boolean }) => {
  const { setNodeRef } = useDroppable({ id: "archive-zone" });

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
        isOver
          ? "border-accent bg-accent/20 scale-105"
          : "border-muted-foreground/30"
      }`}
    >
      <Archive className={`w-5 h-5 mx-auto mb-1 ${isOver ? "text-accent" : "text-muted-foreground"}`} />
      <span className={`text-xs ${isOver ? "text-accent font-medium" : "text-muted-foreground"}`}>
        Drop here to archive
      </span>
    </div>
  );
};

// Sortable conversation item component
const SortableConversationItem = ({
  conv,
  currentConversationId,
  editingId,
  editTitle,
  setEditTitle,
  setEditingId,
  handleRename,
  handleArchive,
  handleDelete,
  onSelectConversation,
}: {
  conv: Conversation;
  currentConversationId: string | null;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  setEditingId: (id: string | null) => void;
  handleRename: (id: string) => void;
  handleArchive: (id: string, archive: boolean) => void;
  handleDelete: (id: string) => void;
  onSelectConversation: (id: string) => void;
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 p-3 rounded-lg transition-all relative overflow-hidden ${
        currentConversationId === conv.id
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/20"
      } ${isDragging ? "shadow-lg z-50" : ""}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>

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
            className="text-sm truncate cursor-pointer flex-1 min-w-0"
            onClick={() => onSelectConversation(conv.id)}
          >
            {conv.title}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(conv.id);
                  setEditTitle(conv.title);
                }}
                className="cursor-pointer"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchive(conv.id, !conv.is_archived);
                }}
                className="cursor-pointer"
              >
                <Archive className="w-4 h-4 mr-2" />
                {conv.is_archived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(conv.id);
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};

// Drag overlay item (shown while dragging)
const DragOverlayItem = ({ conv }: { conv: Conversation }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-accent shadow-xl">
    <GripVertical className="w-4 h-4 text-muted-foreground" />
    <MessageSquare className="w-4 h-4" />
    <span className="text-sm truncate">{conv.title}</span>
  </div>
);

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOverArchive, setIsOverArchive] = useState(false);
  const { toast } = useToast();

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
    const { data: active, error: activeError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })
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

    if (archive) {
      toast({
        title: "Archived",
        description: "Conversation moved to archive",
      });
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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setIsOverArchive(over?.id === "archive-zone");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsOverArchive(false);

    if (!over) return;

    // Check if dropped on archive zone
    if (over.id === "archive-zone") {
      await handleArchive(active.id as string, true);
      return;
    }

    // Handle reordering
    if (active.id !== over.id) {
      const oldIndex = conversations.findIndex((conv) => conv.id === active.id);
      const newIndex = conversations.findIndex((conv) => conv.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(conversations, oldIndex, newIndex);
        setConversations(reordered);
        await updateSortOrder(reordered);
      }
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1 p-2">
          <SortableContext
            items={filteredConversations.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <SortableConversationItem
                  key={conv.id}
                  conv={conv}
                  currentConversationId={currentConversationId}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  setEditingId={setEditingId}
                  handleRename={handleRename}
                  handleArchive={handleArchive}
                  handleDelete={handleDelete}
                  onSelectConversation={onSelectConversation}
                />
              ))}
            </div>
          </SortableContext>

          {/* Archive drop zone - visible when dragging */}
          {activeId && (
            <div className="mt-4">
              <ArchiveDropZone isOver={isOverArchive} />
            </div>
          )}
        </ScrollArea>

        <DragOverlay>
          {activeConversation ? <DragOverlayItem conv={activeConversation} /> : null}
        </DragOverlay>
      </DndContext>

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
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg transition-all relative overflow-hidden ${
                    currentConversationId === conv.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/20"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span
                    className="text-sm truncate cursor-pointer flex-1 min-w-0"
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    {conv.title}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(conv.id, false);
                        }}
                        className="cursor-pointer"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Unarchive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;