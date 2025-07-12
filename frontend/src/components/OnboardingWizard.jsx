import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepAccount from "./steps/StepAccount";
import StepPersonal from "./steps/StepPersonal";
import StepFinancial from "./steps/StepFinancial";
import StepGoals from "./steps/StepGoals";
import StepQuestionnaire from "./steps/StepQuestionnaire";
import StepSummary from "./steps/StepSummary";

// CFA-aligned risk profile questions
const RISK_QUESTIONS = [
  "1. How would you describe your investment experience?",
  "2. What is your primary investment goal?",
  "3. How long do you plan to stay invested?",
  "4. How would you react if your portfolio fell 10% in one month?",
  "5. How important is liquidity (access to cash) for you?",
  "6. What is your comfort level with market volatility?",
  "7. How significant would a loss of 20% affect your goals?",
  "8. How do you prioritize capital preservation vs. growth?",
];


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
    questionnaire: RISK_QUESTIONS.map(() => 3),
  });
  const [valid, setValid] = useState({});
  const last = steps.length - 1;

  const update = (values) => setData((prev) => ({ ...prev, ...values }));
  const next = () => setCurrent((c) => Math.min(c + 1, last));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleFinish = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
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
        goals: data.goals,
        questionnaire: data.questionnaire,
      }),
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

      {current <= 3 && (
        <Step
          data={data}
          update={update}
          validate={(v) => setValid((prev) => ({ ...prev, [current]: v }))}
        />
      )}

      {current === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Risk Questionnaire</h2>
          {RISK_QUESTIONS.map((qText, idx) => (
            <div key={idx} className="flex items-center">
              <span className="flex-1">{qText}</span>
              {[1, 2, 3, 4, 5].map((val) => (
                <label key={val} className="mx-1">
                  <input
                    type="radio"
                    name={`q${idx}`}
                    value={val}
                    checked={data.questionnaire[idx] === val}
                    onChange={() =>
                      setData({
                        ...data,
                        questionnaire: data.questionnaire.map((v, i) =>
                          i === idx ? val : v
                        ),
                      })
                    }
                    className="mr-1"
                  />
                  {val}
                </label>
              ))}
            </div>
          ))}
          <button
            onClick={() => {
              if (data.questionnaire.some((v) => v < 1 || v > 5)) {
                alert("Please answer all risk questions (1–5).");
                return;
              }
              next();
            }}
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2 px-4"
          >
            Next
          </button>
        </div>
      )}

      {current === 5 && (
        <div className="space-y-4 text-gray-800">
          <h2 className="text-xl font-semibold">Review Your Information</h2>
          <div>
            <strong>Email:</strong> {data.email}
          </div>
          <div>
            <strong>Name:</strong> {data.firstName} {data.lastName}
          </div>
          <div>
            <strong>DOB:</strong> {data.dob}
          </div>
          <div>
            <strong>National ID:</strong> {data.nationalId}
          </div>
          <div>
            <strong>KRA PIN:</strong> {data.kraPin}
          </div>
          <div>
            <strong>Annual Income:</strong> KES {Number(data.annualIncome).toLocaleString()}
          </div>
          <div>
            <strong>Dependents:</strong> {data.dependents}
          </div>
          <div>
            <strong>Goal:</strong> {data.goals.type} – KES {Number(data.goals.targetAmount).toLocaleString()} in {data.goals.timeHorizon} yrs
          </div>
          <div>
            <strong>Risk Responses:</strong>
            <ul className="list-disc list-inside">
              {RISK_QUESTIONS.map((q, i) => (
                <li key={i}>{q.replace(/^\d+\.\s/, "")}: {data.questionnaire[i]}/5</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Qualitative Risk Score:</strong> Will be calculated from your responses and shown on your dashboard.
          </div>
          <button
            onClick={handleFinish}
            className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-2 px-6"
          >
            Finish & Create Account
          </button>
        </div>
      )}

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
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2 px-4"
            disabled={!valid[current]}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
