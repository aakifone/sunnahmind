import { createRoot } from "react-dom/client";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ContentPreferencesProvider } from "@/contexts/ContentPreferencesContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <PreferencesProvider>
    <ContentPreferencesProvider>
      <App />
    </ContentPreferencesProvider>
  </PreferencesProvider>
);
