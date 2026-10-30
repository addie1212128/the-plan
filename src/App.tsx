import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { EntityListPage } from "./pages/EntityListPage";
import { EntityDetailPage } from "./pages/EntityDetailPage";
import { WorldPage } from "./pages/WorldPage";
import { AtlasPage } from "./pages/AtlasPage";
import { GraphPage } from "./pages/GraphPage";
import { TimelinePage } from "./pages/TimelinePage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/atlas" element={<AtlasPage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/m/:slug" element={<EntityListPage />} />
        <Route path="/m/:slug/:id" element={<EntityDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
