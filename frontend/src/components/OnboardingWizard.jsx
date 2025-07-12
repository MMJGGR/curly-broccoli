import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepAccount from "./steps/StepAccount";
import StepPersonal from "./steps/StepPersonal";
import StepFinancial from "./steps/StepFinancial";
import StepGoals from "./steps/StepGoals";
import StepQuestionnaire from "./steps/StepQuestionnaire";
import StepSummary from "./steps/StepSummary";


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
  const [data, setData] = useState({});
  const [valid, setValid] = useState({});
  const last = steps.length - 1;

  const update = (values) => setData((prev) => ({ ...prev, ...values }));
  const next = () => setCurrent((c) => Math.min(c + 1, last));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleFinish = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      alert("Registration error: " + err.detail);
      return;
    }
    const { access_token } = await res.json();
    localStorage.setItem("jwt", access_token);
    navigate("/dashboard");
  };

  const Step = steps[current].component;

  return (
    <div className="mx-auto max-w-xl bg-white rounded-2xl shadow-lg p-6 text-gray-800">
      <div className="flex justify-between mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${current === i ? "bg-amber-500 text-white" : "border-2 border-gray-200 text-gray-800"}`}
            >
              {i + 1}
            </div>
            <p className="text-xs mt-1">{step.label}</p>
          </div>
        ))}
      </div>
      <Step
        data={data}
        update={update}
        validate={(v) => setValid((prev) => ({ ...prev, [current]: v }))}
      />
      <div className="flex justify-between mt-6">
        <button
          disabled={current === 0}
          onClick={prev}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2 px-4 disabled:opacity-50"
        >
          Back
        </button>
        {current === last ? (
          <button
            onClick={handleFinish}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2 px-4"
            disabled={!valid[current]}
          >
            Finish
          </button>
        ) : (
          <button
            onClick={next}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2 px-4"
            disabled={!valid[current]}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
