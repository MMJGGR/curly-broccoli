export default function StepAccount({ data, update }) {
  return (
    <div className="space-y-2">
      <input name="email" type="email" value={data.email || ''} onChange={e => update({ email: e.target.value })} placeholder="Email" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
      <input name="password" type="password" value={data.password || ''} onChange={e => update({ password: e.target.value })} placeholder="Password" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
      <input name="confirmPassword" type="password" value={data.confirmPassword || ''} onChange={e => update({ confirmPassword: e.target.value })} placeholder="Confirm Password" className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full" />
    </div>
  );
}
