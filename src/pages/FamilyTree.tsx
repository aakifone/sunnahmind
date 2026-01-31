import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { useTranslate } from "@/hooks/useTranslate";
import { familyTree } from "@/modules/familyTree/familyTreeData";

const FamilyTree = () => {
  const { t } = useTranslate();
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OfflineBanner isOnline={isOnline} />
      <main className="container mx-auto px-4 py-10 space-y-8">
        <section className="space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold gold-text">
            {t("Islamic Family Tree")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "A simple, factual overview of prophetic lineage for learning and reflection.",
            )}
          </p>
        </section>

        <section className="space-y-6">
          {familyTree.map((node) => (
            <div
              key={node.id}
              className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-xl font-semibold">{node.name}</h2>
                  <p className="text-sm text-muted-foreground">{node.title}</p>
                </div>
                {node.parentId && (
                  <span className="text-xs text-muted-foreground">
                    {t("Lineage")}:{" "}
                    {familyTree.find((parent) => parent.id === node.parentId)?.name}
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                {node.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default FamilyTree;
