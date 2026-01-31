import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ThemeController from "@/components/ThemeController";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Articles from "./pages/Articles";
import Ilm from "./pages/Ilm";
import Adhkaar from "./pages/Adhkaar";
import FamilyTree from "./pages/FamilyTree";
import Names from "./pages/Names";
import Wallpaper from "./pages/Wallpaper";
import Saved from "./pages/Saved";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <ThemeController />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/ai" element={<Chat />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/ilm" element={<Ilm />} />
            <Route path="/adhkaar" element={<Adhkaar />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/names" element={<Names />} />
            <Route path="/wallpaper" element={<Wallpaper />} />
            <Route path="/saved" element={<Saved />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
