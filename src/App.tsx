import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Articles from "./pages/Articles";
import Ilm from "./pages/Ilm";
import Adhkaar from "./pages/Adhkaar";
import Wallpapers from "./pages/Wallpapers";
import FamilyTree from "./pages/FamilyTree";
import AllahNames from "./pages/AllahNames";
import Library from "./pages/Library";
import ThemeManager from "@/components/ThemeManager";
import OfflineBanner from "@/components/OfflineBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <ThemeManager />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OfflineBanner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/ai" element={<Chat />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/ilm" element={<Ilm />} />
            <Route path="/adhkaar" element={<Adhkaar />} />
            <Route path="/wallpapers" element={<Wallpapers />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/allah-names" element={<AllahNames />} />
            <Route path="/library" element={<Library />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
