import { useState } from 'react';

const steps = ['Personal Info', 'Employment', 'Dependents', 'Preview'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});

  const next = () => setStep(Math.min(step + 1, steps.length - 1));
  const prev = () => setStep(Math.max(step - 1, 0));

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="max-w-xl mx-auto p-4 text-[#333333]">
      <h2 className="text-xl font-bold mb-4">{steps[step]}</h2>
      {step === 0 && (
        <div className="space-y-2">
          <input name="full_name" onChange={update} placeholder="Full Name*" className="border rounded w-full p-2 border-[#CCCCCC]" />
          <input name="dob" type="date" onChange={update} className="border rounded w-full p-2 border-[#CCCCCC]" />
        </div>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <input name="employment_status" onChange={update} placeholder="Employment Status*" className="border rounded w-full p-2 border-[#CCCCCC]" />
          <input name="monthly_income_kes" onChange={update} placeholder="Monthly Income" className="border rounded w-full p-2 border-[#CCCCCC]" />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          <input name="dependent_name" onChange={update} placeholder="Dependent Name" className="border rounded w-full p-2 border-[#CCCCCC]" />
        </div>
      )}
      {step === 3 && (
        <pre className="bg-[#DDDDDD] p-4 rounded">{JSON.stringify(form, null, 2)}</pre>
      )}
      <div className="mt-4 flex justify-between">
        <button onClick={prev} className="px-4 py-2 bg-[#CCCCCC] rounded" disabled={step===0}>Back</button>
        {step < steps.length - 1 ? (
          <button onClick={next} className="px-4 py-2 bg-[#FF9933] text-white rounded">Next</button>
        ) : (
          <button className="px-4 py-2 bg-[#FF9933] text-white rounded">Submit</button>
        )}
      </div>
    </div>
  );
}
