import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StepAccount from "./steps/StepAccount";
import StepPersonal from "./steps/StepPersonal";
import StepFinancial from "./steps/StepFinancial";
import StepGoals from "./steps/StepGoals";
import StepQuestionnaire from "./steps/StepQuestionnaire";
import StepSummary from "./steps/StepSummary";
import { RISK_QUESTIONS } from "./steps/risk-config";

const steps = [
  { label: "Account", component: StepAccount },
  { label: "Personal", component: StepPersonal },
  { label: "Financial", component: StepFinancial },
  { label: "Goals", component: StepGoals },
  { label: "Questionnaire", component: StepQuestionnaire },
  { label: "Summary", component: StepSummary },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState({
    // default questionnaire responses set to neutral '3'
    questionnaire: RISK_QUESTIONS.map(() => 3),
  });
  const [valid, setValid] = useState({});
  const [profile, setUserProfile] = useState(null);
  const last = steps.length - 1;
  let rawBase;
  try {
    rawBase = new Function("return import.meta.env.VITE_API_BASE_URL")();
  } catch {
    rawBase = process.env.VITE_API_BASE_URL;
  }
  const API_BASE = rawBase && rawBase !== "undefined" ? rawBase : "";

  const update = (values) => setData((prev) => ({ ...prev, ...values }));
  const validateStep = useCallback(
    (v) => setValid((prev) => ({ ...prev, [current]: v })),
    [current],
  );
  const next = () => setCurrent((c) => Math.min(c + 1, last));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleFinish = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          dob: data.dob,
          nationalId: data.nationalId,
          kra_pin: data.kraPin,
          annual_income: Number(data.annualIncome),
          dependents: Number(data.dependents),
          goals: {
            ...data.goals,
            targetAmount: Number(data.goals?.targetAmount),
            timeHorizon: Number(data.goals?.timeHorizon),
          },
          questionnaire: data.questionnaire.map((q) => Number(q)),
        }),
      });
      if (!res.ok) {
        let message = res.statusText;
        try {
          const err = await res.json();
          message = err.detail || err.message || message;
        } catch {
          // non-JSON error response
        }
        alert("Registration error: " + message);
        return false;
      }
      let access_token;
      try {
        ({ access_token } = await res.json());
      } catch {
        console.error("Registration response was not JSON");
        alert("Unexpected server response. Please try again later.");
        return false;
      }
      localStorage.setItem("jwt", access_token);
      // fetch profile after registration
      const profileRes = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      let userProfile;
      try {
        userProfile = await profileRes.json();
      } catch {
        console.error("Profile response was not JSON");
        alert("Unable to load profile. Please try again later.");
        return false;
      }
      setUserProfile(userProfile);
      return true;
    } catch (err) {
      console.error("Registration request failed", err);
      alert(
        "Unable to complete registration. Please check your connection and try again.",
      );
      return false;
    }
  };

  const StepComponent = steps[current].component;

  return (
    <div className="mx-auto max-w-xl bg-white rounded-2xl shadow-lg p-6 text-gray-800">
      {/* Stepper Header */}
      <div className="flex justify-between mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                current === i
                  ? "bg-amber-500 text-white"
                  : "border-2 border-gray-200 text-gray-800"
              }`}
            >
              {i + 1}
            </div>
            <p className="text-xs mt-1">{step.label}</p>
          </div>
        ))}
      </div>

      {/* Render steps 0–3 with validation */}
      {current <= 3 && (
        <StepComponent data={data} update={update} validate={validateStep} />
      )}

      {/* Step 4: Questionnaire */}
      {current === 4 && (
        <StepQuestionnaire data={data} update={update} next={next} />
      )}

      {/* Step 5: Summary & Finish */}
      {current === 5 && (
        <StepSummary
          data={data}
          profile={profile}
          handleFinish={handleFinish}
        />
      )}

      {/* Navigation Buttons for steps 0–3 */}
      {current <= 3 && (
        <div className="flex justify-between mt-6">
          <button
            disabled={current === 0}
            onClick={prev}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2 px-4 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={!valid[current]}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2 px-4"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
