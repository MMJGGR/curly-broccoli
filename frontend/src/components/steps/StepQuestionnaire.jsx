// TODO: Submit risk answers for risk scoring (Epic 1 extra, ~70% completion)
import React from "react";
import { RISK_QUESTIONS, RISK_SCALE } from "./risk-config";

export default function StepQuestionnaire({ data, update, next }) {
  const questionnaire = data.questionnaire || [];

  const updateQuestion = (idx, score) => {
    const arr = [...questionnaire];
    arr[idx] = score;
    update({ questionnaire: arr });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Risk Questionnaire</h2>
      {RISK_QUESTIONS.map((q, i) => (
        <div key={i} className="flex items-center">
          <div className="flex-1">{q}</div>
          {[1,2,3,4,5].map((score) => (
            <label key={score} className="mx-1 flex flex-col items-center">
              <input
                type="radio"
                name={`q${i}`}
                value={score}
                checked={questionnaire[i] === score}
                onChange={() => updateQuestion(i, score)}
                className="mb-1"
              />
              <span className="text-xs">{score}</span>
            </label>
          ))}
        </div>
      ))}
      <div className="text-sm text-gray-600 mt-2 grid grid-cols-5 gap-x-4">
        {Object.entries(RISK_SCALE).map(([num,label])=>(
          <div key={num} className="text-center">
            <strong>{num}</strong><br />{label}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          if (questionnaire.some((v) => v < 1 || v > 5)) {
            alert("Please answer every question on a 1–5 scale.");
            return;
          }
          next();
        }}
        className="mt-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2 px-6"
      >
        Next
      </button>
    </div>
  );
}
