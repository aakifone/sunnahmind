import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, X, Archive, Trash2, RotateCcw, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MushafIcon from "@/components/icons/MushafIcon";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface Conversation {
  id: string;
  title: string;
  is_archived: boolean;
  deleted_at?: string | null;
  updated_at: string;
  sort_order?: number;
}

interface SwipeableConversationItemProps {
  conv: Conversation;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onStartEdit: (id: string) => void;
  isDeleted?: boolean;
  isArchived?: boolean;
  isDraggable?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const SwipeableConversationItem = ({
  conv,
  currentConversationId,
  onSelectConversation,
  onArchive,
  onDelete,
  onRestore,
  onRename,
  onStartEdit,
  isDeleted = false,
  isArchived = false,
  isDraggable = false,
  dragHandleProps,
}: SwipeableConversationItemProps) => {
  const [swipeX, setSwipeX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conv.title);
  const [showActions, setShowActions] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const SWIPE_THRESHOLD = 60;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset swipe when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
        setShowActions(false);
        setSwipeX(0);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || !isMobile) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Only allow left swipe (negative)
    setSwipeX(Math.max(-120, Math.min(0, diff)));
  };

  const handleTouchEnd = () => {
    if (!isSwiping || !isMobile) return;
    setIsSwiping(false);

    // If swiped past threshold, show action buttons
    if (swipeX < -SWIPE_THRESHOLD) {
      setShowActions(true);
      setSwipeX(-120); // Lock in position to show buttons
    } else {
      setShowActions(false);
      setSwipeX(0);
    }
  };

  const handleSaveRename = () => {
    if (editTitle.trim() && editTitle !== conv.title) {
      onRename(conv.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditTitle(conv.title);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditTitle(conv.title);
    setIsEditing(true);
    setShowActions(false);
    setSwipeX(0);
  };

  // Calculate days until permanent deletion for deleted items
  const getDaysRemaining = () => {
    if (!conv.deleted_at) return null;
    const deletedDate = new Date(conv.deleted_at);
    const now = new Date();
    const diffTime = 15 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  const renderContent = () => (
    <div
      ref={itemRef}
      className={`relative overflow-hidden rounded-lg transition-colors ${
        currentConversationId === conv.id
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/20"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Action buttons revealed on swipe (mobile only) */}
      {isMobile && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          {isDeleted ? (
            <>
              <Button
                size="sm"
                className="h-full rounded-none px-4 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  onRestore(conv.id);
                  setShowActions(false);
                  setSwipeX(0);
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className="h-full rounded-none px-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  onArchive(conv.id);
                  setShowActions(false);
                  setSwipeX(0);
                }}
              >
                <Archive className="w-4 h-4" />
              </Button>
            </>
          ) : isArchived ? (
            <>
              <Button
                size="sm"
                className="h-full rounded-none px-4 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  onRestore(conv.id);
                  setShowActions(false);
                  setSwipeX(0);
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className="h-full rounded-none px-4 bg-destructive hover:bg-destructive/90 text-white"
                onClick={() => {
                  onDelete(conv.id);
                  setShowActions(false);
                  setSwipeX(0);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="h-full rounded-none px-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  onArchive(conv.id);
                  setShowActions(false);
                  setSwipeX(0);
                }}
              >
                <Archive className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className="h-full rounded-none px-4 bg-destructive hover:bg-destructive/90 text-white"
                onClick={() => {
                  onDelete(conv.id);
                  setShowActions(false);
                  setSwipeX(0);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )}

      <div
        className="flex items-center gap-2 p-3 transition-transform bg-card"
        style={{ transform: isMobile ? `translateX(${swipeX}px)` : undefined }}
      >
        {/* Drag handle for desktop */}
        {isDraggable && !isMobile && dragHandleProps && (
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing touch-none">
            <div className="w-4 h-4 flex flex-col justify-center gap-0.5">
              <div className="w-full h-0.5 bg-muted-foreground/50 rounded" />
              <div className="w-full h-0.5 bg-muted-foreground/50 rounded" />
              <div className="w-full h-0.5 bg-muted-foreground/50 rounded" />
            </div>
          </div>
        )}

        <MushafIcon className="flex-shrink-0 text-current" size={16} />

        {isEditing ? (
          <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveRename();
                if (e.key === "Escape") handleCancelRename();
              }}
              onBlur={handleSaveRename}
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleSaveRename}
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleCancelRename}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-w-0" onClick={() => onSelectConversation(conv.id)}>
            <span className="text-sm truncate cursor-pointer block">
              {conv.title}
            </span>
            {isDeleted && daysRemaining !== null && (
              <span className="text-xs text-muted-foreground">
                Deletes in {daysRemaining} days
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Desktop: wrap with context menu
  if (!isMobile) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {renderContent()}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          {isDeleted ? (
            <>
              <ContextMenuItem onClick={() => onRestore(conv.id)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onArchive(conv.id)}>
                <Archive className="w-4 h-4 mr-2" />
                Move to Archive
              </ContextMenuItem>
            </>
          ) : isArchived ? (
            <>
              <ContextMenuItem onClick={() => onRestore(conv.id)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Unarchive
              </ContextMenuItem>
              <ContextMenuItem onClick={startEditing}>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => onDelete(conv.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem onClick={startEditing}>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onArchive(conv.id)}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => onDelete(conv.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // Mobile: just render the swipeable content
  return renderContent();
};

export default SwipeableConversationItem;
