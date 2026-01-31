import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslate } from "@/hooks/useTranslate";
import { articles } from "@/data/articles";
import { BookmarkPlus, BookmarkCheck, Share2, Volume2 } from "lucide-react";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useState } from "react";
import { saveOfflineItem } from "@/lib/offlineStore";
import { useContentPreferences } from "@/contexts/ContentPreferencesContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Articles = () => {
  const { t } = useTranslate();
  const { addItem, getByList } = useSavedContent();
  const { articleLanguage, setArticleLanguage, options } = useContentPreferences();
  const favorites = getByList("favorites", "article");
  const later = getByList("later", "article");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredArticles = articles.filter(
    (article) =>
      article.language.toLowerCase() === articleLanguage.label.toLowerCase() ||
      articleLanguage.label === "English",
  );
  const displayArticles = (filteredArticles.length > 0 ? filteredArticles : articles).filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRead = (content: string) => {
    const utterance = new SpeechSynthesisUtterance(content);
    speechSynthesis.speak(utterance);
  };

  const handleSave = (articleId: string, list: "favorites" | "later") => {
    const article = articles.find((item) => item.id === articleId);
    if (!article) return;
    addItem({
      type: "article",
      title: article.title,
      content: article.content,
      source: article.category,
      language: article.language,
      list,
    });
    saveOfflineItem("articles", article);
  };

  const handleShare = async (title: string, content: string) => {
    const shareText = `${title}\n\n${content}`;
    if (navigator.share) {
      await navigator.share({ title, text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{t("SunnahMind Articles")}</h1>
            <p className="text-muted-foreground">
              {t("Timeless Islamic articles designed for calm reflection and daily learning.")}
            </p>
            <div className="max-w-xs">
              <Select value={articleLanguage.code} onValueChange={setArticleLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select article language")} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder={t("Search articles")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-6">
            {displayArticles.map((article) => {
              const isFavorite = favorites.some((item) => item.title === article.title);
              const isLater = later.some((item) => item.title === article.title);

              return (
                <article
                  key={article.id}
                  className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{article.category}</Badge>
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant="outline">{article.language}</Badge>
                  </div>
                  <h2 className="text-2xl font-semibold mt-4">{article.title}</h2>
                  <p className="text-sm text-muted-foreground mt-2">{article.summary}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                    {article.content}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleRead(article.content)}>
                      <Volume2 className="w-4 h-4 mr-2" />
                      {t("Read aloud")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(article.id, "favorites")}
                    >
                      {isFavorite ? (
                        <BookmarkCheck className="w-4 h-4 mr-2" />
                      ) : (
                        <BookmarkPlus className="w-4 h-4 mr-2" />
                      )}
                      {t("Save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(article.id, "later")}
                    >
                      {isLater ? (
                        <BookmarkCheck className="w-4 h-4 mr-2" />
                      ) : (
                        <BookmarkPlus className="w-4 h-4 mr-2" />
                      )}
                      {t("Saved for later")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(article.title, article.content)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {t("Share")}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Articles;
