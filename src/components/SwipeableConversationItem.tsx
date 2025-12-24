import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MushafIcon from "@/components/icons/MushafIcon";

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
  isDeleted?: boolean;
  isArchived?: boolean;
}

const SwipeableConversationItem = ({
  conv,
  currentConversationId,
  onSelectConversation,
  onArchive,
  onDelete,
  onRestore,
  onRename,
  isDeleted = false,
  isArchived = false,
}: SwipeableConversationItemProps) => {
  const [swipeX, setSwipeX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conv.title);
  const itemRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const SWIPE_THRESHOLD = 80;
  const RENAME_THRESHOLD = 60;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setSwipeX(Math.max(-150, Math.min(150, diff)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    const diff = e.clientX - startX;
    setSwipeX(Math.max(-150, Math.min(150, diff)));
  };

  const handleEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    // Swipe right to rename (only if not deleted)
    if (swipeX > RENAME_THRESHOLD && !isDeleted) {
      setIsEditing(true);
      setEditTitle(conv.title);
    }
    // Swipe left to archive (blue)
    else if (swipeX < -SWIPE_THRESHOLD) {
      if (isDeleted) {
        // From deleted -> archive
        onArchive(conv.id);
      } else if (isArchived) {
        // From archived -> restore to active
        onRestore(conv.id);
      } else {
        // From active -> archive
        onArchive(conv.id);
      }
    }
    // Swipe right past threshold to delete (red) - only for already swiping right
    else if (swipeX > SWIPE_THRESHOLD && isDeleted) {
      // Already deleted, restore
      onRestore(conv.id);
    }

    setSwipeX(0);
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

  // Determine background color based on swipe direction
  const getBackgroundStyle = () => {
    if (swipeX < -20) {
      // Swiping left - archive (blue)
      const intensity = Math.min(Math.abs(swipeX) / SWIPE_THRESHOLD, 1);
      return {
        background: `hsl(210, 70%, ${50 - intensity * 10}%, ${intensity * 0.4})`,
      };
    } else if (swipeX > 20 && !isDeleted) {
      // Swiping right - rename (subtle)
      const intensity = Math.min(swipeX / RENAME_THRESHOLD, 1);
      return {
        background: `hsl(var(--accent) / ${intensity * 0.3})`,
      };
    } else if (swipeX > 20 && isDeleted) {
      // Swiping right on deleted - restore (green)
      const intensity = Math.min(swipeX / SWIPE_THRESHOLD, 1);
      return {
        background: `hsl(142, 70%, 45%, ${intensity * 0.4})`,
      };
    }
    return {};
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

  return (
    <div
      ref={itemRef}
      className={`relative overflow-hidden rounded-lg transition-colors ${
        currentConversationId === conv.id
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/20"
      }`}
      style={getBackgroundStyle()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={() => {
        if (isSwiping) {
          setIsSwiping(false);
          setSwipeX(0);
        }
      }}
    >
      {/* Swipe indicator icons */}
      {swipeX < -20 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400">
          <span className="text-xs font-medium">
            {isArchived ? "Restore" : "Archive"}
          </span>
        </div>
      )}
      {swipeX > 20 && !isDeleted && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-accent-foreground/70">
          <span className="text-xs font-medium">Rename</span>
        </div>
      )}
      {swipeX > 20 && isDeleted && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400">
          <span className="text-xs font-medium">Restore</span>
        </div>
      )}

      <div
        className="flex items-center gap-2 p-3 transition-transform"
        style={{ transform: `translateX(${swipeX}px)` }}
      >
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
};

export default SwipeableConversationItem;
