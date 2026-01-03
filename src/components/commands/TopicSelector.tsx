import { cn } from "@/lib/utils";

const TOPICS = [
  { id: "patience", label: "Patience", emoji: "🤲" },
  { id: "salah", label: "Salah", emoji: "🕌" },
  { id: "parents", label: "Parents", emoji: "👨‍👩‍👧" },
  { id: "honesty", label: "Honesty", emoji: "✨" },
  { id: "charity", label: "Charity", emoji: "💝" },
  { id: "knowledge", label: "Knowledge", emoji: "📚" },
  { id: "marriage", label: "Marriage", emoji: "💍" },
  { id: "fasting", label: "Fasting", emoji: "🌙" },
  { id: "kindness", label: "Kindness", emoji: "💫" },
  { id: "forgiveness", label: "Forgiveness", emoji: "🕊️" },
];

interface TopicSelectorProps {
  onSelectTopic: (topic: string) => void;
}

export const TopicSelector = ({ onSelectTopic }: TopicSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {TOPICS.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelectTopic(topic.label)}
          className={cn(
            "px-4 py-2 rounded-full",
            "bg-white/20 hover:bg-white/30",
            "text-white text-sm font-medium",
            "transition-all duration-200",
            "border border-white/20",
            "flex items-center gap-2"
          )}
        >
          <span>{topic.emoji}</span>
          <span>{topic.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TopicSelector;
