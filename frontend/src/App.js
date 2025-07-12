import OnboardingWizard from "./components/OnboardingWizard";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="bg-white min-h-screen p-4">
      <Routes>
        <Route path="/onboarding" element={<OnboardingWizard />} />
      </Routes>
    </div>
  );
}

export default App;
