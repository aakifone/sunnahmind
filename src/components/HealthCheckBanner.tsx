import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Loader2, Wifi, Database, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface HealthStatus {
  auth: "checking" | "connected" | "error";
  database: "checking" | "connected" | "error";
  latency: number | null;
}

const HealthCheckBanner = () => {
  const [status, setStatus] = useState<HealthStatus>({
    auth: "checking",
    database: "checking",
    latency: null,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runHealthCheck = useCallback(async () => {
    setStatus((prev) => ({
      ...prev,
      auth: "checking",
      database: "checking",
    }));

    const startTime = performance.now();

    // Check auth
    try {
      const { error } = await supabase.auth.getSession();
      setStatus((prev) => ({
        ...prev,
        auth: error ? "error" : "connected",
      }));
    } catch {
      setStatus((prev) => ({ ...prev, auth: "error" }));
    }

    // Check database with a simple query
    try {
      const { error } = await supabase
        .from("conversations")
        .select("id")
        .limit(1);
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      setStatus((prev) => ({
        ...prev,
        database: error ? "error" : "connected",
        latency,
      }));
    } catch {
      setStatus((prev) => ({ ...prev, database: "error", latency: null }));
    }

    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    runHealthCheck();
    const interval = setInterval(runHealthCheck, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [runHealthCheck]);

  const getStatusIcon = (s: "checking" | "connected" | "error") => {
    switch (s) {
      case "checking":
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
      case "connected":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "error":
        return <XCircle className="h-3 w-3 text-destructive" />;
    }
  };

  const allConnected = status.auth === "connected" && status.database === "connected";
  const hasError = status.auth === "error" || status.database === "error";

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-lg border bg-card/95 backdrop-blur-sm shadow-lg transition-all duration-200",
        isExpanded ? "p-3" : "p-2",
        hasError && "border-destructive/50"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Wifi className={cn("h-3 w-3", allConnected ? "text-green-500" : hasError ? "text-destructive" : "text-muted-foreground")} />
        {isExpanded ? "Health Check" : ""}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wifi className="h-3 w-3" />
              Auth
            </span>
            {getStatusIcon(status.auth)}
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Database className="h-3 w-3" />
              Database
            </span>
            {getStatusIcon(status.database)}
          </div>

          {status.latency !== null && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Latency
              </span>
              <span className={cn(
                "font-mono",
                status.latency < 200 ? "text-green-500" : status.latency < 500 ? "text-yellow-500" : "text-destructive"
              )}>
                {status.latency}ms
              </span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              runHealthCheck();
            }}
            className="mt-2 w-full rounded bg-muted px-2 py-1 text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            Refresh
          </button>

          {lastChecked && (
            <p className="text-[10px] text-muted-foreground text-center">
              Last: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthCheckBanner;
