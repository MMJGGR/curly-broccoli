import { useEffect, useState } from 'react';

export default function StepGoals({ data, update, validate }) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const errs = {};
    if (!data.goalType) errs.goalType = 'Goal type is required';
    if (data.targetAmount === undefined || data.targetAmount === '' || Number(data.targetAmount) <= 0) {
      errs.targetAmount = 'Amount must be greater than 0';
    }
    if (data.timeHorizon === undefined || data.timeHorizon === '' || Number(data.timeHorizon) <= 0) {
      errs.timeHorizon = 'Time horizon must be greater than 0';
    }
    setErrors(errs);
    validate(Object.keys(errs).length === 0);
  }, [data, validate]);

  return (
    <div className="space-y-2">
      <div>
        <select
          name="goalType"
          value={data.goalType || ''}
          onChange={e => update({ goalType: e.target.value })}
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        >
          <option value="">Goal Type</option>
          <option>Retirement</option>
          <option>Education</option>
          <option>Wealth</option>
        </select>
        {errors.goalType && <p className="text-red-600 text-sm">{errors.goalType}</p>}
      </div>
      <div>
        <input
          name="targetAmount"
          type="number"
          value={data.targetAmount || ''}
          onChange={e => update({ targetAmount: e.target.value })}
          placeholder="Target Amount"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.targetAmount && <p className="text-red-600 text-sm">{errors.targetAmount}</p>}
      </div>
      <div>
        <input
          name="timeHorizon"
          type="number"
          value={data.timeHorizon || ''}
          onChange={e => update({ timeHorizon: e.target.value })}
          placeholder="Time Horizon (yrs)"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.timeHorizon && <p className="text-red-600 text-sm">{errors.timeHorizon}</p>}
      </div>
    </div>
  );
}
