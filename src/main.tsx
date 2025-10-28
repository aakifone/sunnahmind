import { createRoot } from "react-dom/client";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <PreferencesProvider>
    <App />
  </PreferencesProvider>
);
