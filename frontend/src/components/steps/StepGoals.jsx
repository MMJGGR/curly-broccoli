export default function StepGoals({ data, update }) {
  return (
    <div className="space-y-2">
      <select name="goalType" value={data.goalType || ''} onChange={e => update({ goalType: e.target.value })} className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full">
        <option value="">Goal Type</option>
        <option>Retirement</option>
        <option>Education</option>
        <option>Wealth</option>
      </select>
      <input name="targetAmount" type="number" value={data.targetAmount || ''} onChange={e => update({ targetAmount: e.target.value })} placeholder="Target Amount" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
      <input name="timeHorizon" type="number" value={data.timeHorizon || ''} onChange={e => update({ timeHorizon: e.target.value })} placeholder="Time Horizon (yrs)" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
    </div>
  );
}
