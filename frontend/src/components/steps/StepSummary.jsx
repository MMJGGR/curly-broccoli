import React from "react";
import { useNavigate } from "react-router-dom";
import { RISK_QUESTIONS, RISK_SCALE } from "./risk-config";

export default function StepSummary({ data, profile, handleFinish }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 text-gray-800">
      <h2 className="text-xl font-semibold">Review & Confirm</h2>
      <div><strong>Email:</strong> {data.email}</div>
      <div><strong>Name:</strong> {data.firstName} {data.lastName}</div>
      <div><strong>DOB:</strong> {data.dob}</div>
      <div><strong>National ID:</strong> {data.nationalId}</div>
      <div><strong>KRA PIN:</strong> {data.kraPin}</div>
      <div><strong>Annual Income:</strong> KES {Number(data.annualIncome).toLocaleString()}</div>
      <div><strong>Dependents:</strong> {data.dependents}</div>
      <div><strong>Goal:</strong> {data.goals.type} – KES {Number(data.goals.targetAmount).toLocaleString()} in {data.goals.timeHorizon} yrs</div>
      <div>
        <strong>Your Responses:</strong>
        <ul className="list-disc list-inside">
          {RISK_QUESTIONS.map((q, i) => (
            <li key={i}>
              {q}: {data.questionnaire[i]}/5 ({RISK_SCALE[data.questionnaire[i]]})
            </li>
          ))}
        </ul>
      </div>
      {profile && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
          <strong>Your Risk Tolerance Level:</strong>
          <span className="ml-2 text-2xl text-amber-600">
            {profile.risk_level} / 5
          </span>
          <p className="text-sm text-gray-600 mt-1">1 = Very Conservative → 5 = Aggressive</p>
        </div>
      )}
      <button
        onClick={async () => {
          const ok = await handleFinish();
          if (ok) {
            navigate("/dashboard");
          }
        }}
        className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-2 px-6"
      >
        Finish & Create Account
      </button>
    </div>
  );
}
