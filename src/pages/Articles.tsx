import { useMemo, useState } from "react";
import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import { useTranslate } from "@/hooks/useTranslate";
import { useContentLanguages } from "@/hooks/useContentLanguages";
import { useSavedForLater } from "@/hooks/useSavedForLater";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { articles } from "@/modules/articles/articlesData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, BookmarkPlus, Share2 } from "lucide-react";

const Articles = () => {
  const { t } = useTranslate();
  const { languages, updateLanguage } = useContentLanguages();
  const { saveForLater } = useSavedForLater();
  const isOnline = useOnlineStatus();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const availableTags = useMemo(
    () => Array.from(new Set(articles.flatMap((article) => article.tags))),
    [],
  );

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const translation = article.translations.find(
        (item) => item.language === languages.articles,
      );
      const content = translation?.title ?? article.translations[0]?.title ?? "";
      const matchesQuery = content.toLowerCase().includes(query.toLowerCase());
      const matchesTag = activeTag ? article.tags.includes(activeTag) : true;
      return matchesQuery && matchesTag;
    });
  }, [activeTag, languages.articles, query]);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedArticleId),
    [selectedArticleId],
  );

  const selectedTranslation = useMemo(() => {
    if (!selectedArticle) return null;
    return (
      selectedArticle.translations.find(
        (item) => item.language === languages.articles,
      ) ?? selectedArticle.translations[0]
    );
  }, [languages.articles, selectedArticle]);

  const handleReadAloud = () => {
    if (!selectedTranslation) return;
    const utterance = new SpeechSynthesisUtterance(
      `${selectedTranslation.title}. ${selectedTranslation.body.join(" ")}`,
    );
    speechSynthesis.speak(utterance);
  };

  const handleSaveArticle = () => {
    if (!selectedTranslation || !selectedArticle) return;
    saveForLater({
      type: "article",
      title: selectedTranslation.title,
      content: selectedTranslation.body.join("\n\n"),
      reference: selectedArticle.category,
      metadata: { language: selectedTranslation.language },
    });
  };

  const handleShareArticle = async () => {
    if (!selectedTranslation) return;
    const shareText = `${selectedTranslation.title}\n\n${selectedTranslation.summary}`;
    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OfflineBanner isOnline={isOnline} />
      <main className="container mx-auto px-4 py-10 space-y-10">
        <section className="space-y-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold gold-text">
            {t("SunnahMind Articles")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Timeless reflections, organized by theme and built for gentle daily reading.",
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder={t("Search articles")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="max-w-sm"
            />
            <Select
              value={languages.articles}
              onValueChange={(value) => updateLanguage("articles", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("Language")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="ur">اردو</SelectItem>
                <SelectItem value="tr">Türkçe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              onClick={() => setActiveTag(null)}
              className={!activeTag ? "bg-accent text-accent-foreground" : "bg-muted"}
            >
              {t("All")}
            </Badge>
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={activeTag === tag ? "bg-accent text-accent-foreground" : "bg-muted"}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.1fr_1fr] gap-10">
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const translation =
                article.translations.find((item) => item.language === languages.articles) ??
                article.translations[0];
              return (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticleId(article.id)}
                  className={`w-full text-left border rounded-xl p-5 transition-all ${
                    selectedArticleId === article.id
                      ? "border-accent/60 bg-accent/5 shadow-gold-glow"
                      : "border-border/50 bg-card hover:border-accent/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{translation.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {translation.summary}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{article.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            {selectedTranslation ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedTranslation.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedArticle?.category} • {selectedArticle?.updatedAt}
                  </p>
                </div>
                <div className="space-y-4 text-sm leading-relaxed">
                  {selectedTranslation.body.map((paragraph, index) => (
                    <p key={index} className="text-foreground/90">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={handleReadAloud}>
                    <Volume2 className="w-4 h-4 mr-2" />
                    {t("Read aloud")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveArticle}>
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    {t("Save for later")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShareArticle}>
                    <Share2 className="w-4 h-4 mr-2" />
                    {t("Share")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("Select an article to begin reading.")}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Articles;
