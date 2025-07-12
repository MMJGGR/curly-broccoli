export default function StepFinancial({ data, update }) {
  return (
    <div className="space-y-2">
      <input name="annualIncome" type="number" value={data.annualIncome || ''} onChange={e => update({ annualIncome: e.target.value })} placeholder="Annual Income" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
      <select name="employmentStatus" value={data.employmentStatus || ''} onChange={e => update({ employmentStatus: e.target.value })} className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full">
        <option value="">Employment Status</option>
        <option>Employed</option>
        <option>Self-employed</option>
        <option>Unemployed</option>
        <option>Student</option>
        <option>Retired</option>
      </select>
      <input name="dependents" type="number" value={data.dependents || ''} onChange={e => update({ dependents: e.target.value })} placeholder="Dependents" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
    </div>
  );
}
