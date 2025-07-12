export default function StepPersonal({ data, update }) {
  return (
    <div className="space-y-2">
      <input name="firstName" value={data.firstName || ''} onChange={e => update({ firstName: e.target.value })} placeholder="First Name" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
      <input name="lastName" value={data.lastName || ''} onChange={e => update({ lastName: e.target.value })} placeholder="Last Name" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
      <input name="dob" type="date" value={data.dob || ''} onChange={e => update({ dob: e.target.value })} className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
      <input name="nationalId" value={data.nationalId || ''} onChange={e => update({ nationalId: e.target.value })} placeholder="National ID" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
      <input name="kraPin" value={data.kraPin || ''} onChange={e => update({ kraPin: e.target.value })} placeholder="KRA PIN" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
    </div>
  );
}
