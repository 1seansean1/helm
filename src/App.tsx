import { Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { HomePage } from "./components/HomePage";
import { ModulePage } from "./components/ModulePage";
import { ProgressPage } from "./components/ProgressPage";
import { LeadershipPage } from "./components/LeadershipPage";
import { SettingsPage } from "./components/SettingsPage";
import { HelpPage } from "./components/HelpPage";
import { TutorialPage } from "./components/TutorialPage";
import { WorkedExamplePage } from "./components/WorkedExamplePage";
import { PocketPage } from "./components/PocketPage";

export function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/module/:id" element={<ModulePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/leadership" element={<LeadershipPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/worked-example" element={<WorkedExamplePage />} />
        <Route path="/pocket" element={<PocketPage />} />
      </Routes>
    </Shell>
  );
}
