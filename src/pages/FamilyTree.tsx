import Header from "@/components/Header";
import { prophetsLineage, FamilyNode } from "@/data/prophetsLineage";
import { useTranslate } from "@/hooks/useTranslate";

const renderNode = (node: FamilyNode, depth = 0) => (
  <div key={node.id} className="space-y-4">
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wider text-muted-foreground">
          {`Generation ${depth + 1}`}
        </p>
        <h3 className="text-lg font-semibold">{node.name}</h3>
        <p className="text-sm text-muted-foreground">{node.description}</p>
      </div>
    </div>
    {node.children && (
      <div className="ml-6 border-l border-border/60 pl-6 space-y-4">
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )}
  </div>
);

const FamilyTree = () => {
  const { t } = useTranslate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{t("Islamic Family Tree")}</h1>
            <p className="text-muted-foreground">
              {t("A simple, factual lineage of key prophets without speculation.")}
            </p>
          </div>

          <div className="space-y-6">
            {prophetsLineage.map((node) => renderNode(node))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FamilyTree;
