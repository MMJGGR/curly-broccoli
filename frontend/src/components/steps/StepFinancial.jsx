// TODO: Save income/expense forms to backend (Epic 1 Stories 3-5, ~80% completion)
import { useEffect, useState } from "react";

export default function StepFinancial({ data, update, validate }) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const errs = {};
    if (!data.employmentStatus)
      errs.employmentStatus = "Employment status is required";
    if (
      data.annualIncome === undefined ||
      data.annualIncome === "" ||
      Number(data.annualIncome) < 0
    ) {
      errs.annualIncome = "Income must be 0 or more";
    }
    if (
      data.dependents === undefined ||
      data.dependents === "" ||
      Number(data.dependents) < 0
    ) {
      errs.dependents = "Dependents must be 0 or more";
    }
    setErrors(errs);
    validate(Object.keys(errs).length === 0);
  }, [data.annualIncome, data.employmentStatus, data.dependents, validate]);

  return (
    <div className="space-y-2">
      <div>
        <input
          name="annualIncome"
          type="number"
          value={data.annualIncome || ""}
          onChange={(e) => update({ annualIncome: e.target.value })}
          placeholder="Annual Income"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.annualIncome && (
          <p className="text-red-600 text-sm">{errors.annualIncome}</p>
        )}
      </div>
      <div>
        <select
          name="employmentStatus"
          value={data.employmentStatus || ""}
          onChange={(e) => update({ employmentStatus: e.target.value })}
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        >
          <option value="">Employment Status</option>
          <option>Employed</option>
          <option>Self-employed</option>
          <option>Unemployed</option>
          <option>Student</option>
          <option>Retired</option>
        </select>
        {errors.employmentStatus && (
          <p className="text-red-600 text-sm">{errors.employmentStatus}</p>
        )}
      </div>
      <div>
        <input
          name="dependents"
          type="number"
          value={data.dependents || ""}
          onChange={(e) => update({ dependents: e.target.value })}
          placeholder="Dependents"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.dependents && (
          <p className="text-red-600 text-sm">{errors.dependents}</p>
        )}
      </div>
    </div>
  );
}
