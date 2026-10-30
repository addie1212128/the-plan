import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { EntityListPage } from "./pages/EntityListPage";
import { EntityDetailPage } from "./pages/EntityDetailPage";
import { TimelinePage } from "./pages/TimelinePage";
import { SettingsPage } from "./pages/SettingsPage";

// Heavy / visual routes are split into their own chunks so the big 3D stack
// (three + fiber + drei) and d3-force only load when actually visited.
const WorldPage = lazy(() => import("./pages/WorldPage").then((m) => ({ default: m.WorldPage })));
const GraphPage = lazy(() => import("./pages/GraphPage").then((m) => ({ default: m.GraphPage })));
const AtlasPage = lazy(() => import("./pages/AtlasPage").then((m) => ({ default: m.AtlasPage })));

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center text-parchment-300/50">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/world" element={<WorldPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/atlas" element={<AtlasPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/m/:slug" element={<EntityListPage />} />
          <Route path="/m/:slug/:id" element={<EntityDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
