import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  cta: string;
  route: string;
}

const ModuleCard = ({ title, description, icon, cta, route }: ModuleCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-elegant transition-all">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        className="mt-5 w-full"
        onClick={() => navigate(route)}
      >
        {cta}
      </Button>
    </div>
  );
};

export default ModuleCard;
