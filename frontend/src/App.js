import OnboardingWizard from "./components/OnboardingWizard";
import Dashboard from "./components/Dashboard";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <div className="bg-white min-h-screen p-4">
      <Routes>
        {/* Redirect the root URL straight into your wizard */}
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        {/* This is where your hook will get a Router context */}
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* (Optional) catch-all to redirect elsewhere or show 404 */}
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </div>
  );
}

export default App;
