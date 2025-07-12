import { useEffect, useState } from 'react';

export default function StepPersonal({ data, update, validate }) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const errs = {};
    if (!data.firstName) errs.firstName = 'First name is required';
    if (!data.lastName) errs.lastName = 'Last name is required';
    if (!data.dob) errs.dob = 'Date of birth is required';
    if (!data.nationalId) errs.nationalId = 'National ID is required';
    if (!data.kraPin) errs.kraPin = 'KRA PIN is required';
    setErrors(errs);
    validate(Object.keys(errs).length === 0);
  }, [data, validate]);

  return (
    <div className="space-y-2">
      <div>
        <input
          name="firstName"
          value={data.firstName || ''}
          onChange={e => update({ firstName: e.target.value })}
          placeholder="First Name"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
      </div>
      <div>
        <input
          name="lastName"
          value={data.lastName || ''}
          onChange={e => update({ lastName: e.target.value })}
          placeholder="Last Name"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
      </div>
      <div>
        <input
          name="dob"
          type="date"
          value={data.dob || ''}
          onChange={e => update({ dob: e.target.value })}
          placeholder="Date of Birth"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.dob && <p className="text-red-600 text-sm">{errors.dob}</p>}
      </div>
      <div>
        <input
          name="nationalId"
          value={data.nationalId || ''}
          onChange={e => update({ nationalId: e.target.value })}
          placeholder="National ID"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.nationalId && <p className="text-red-600 text-sm">{errors.nationalId}</p>}
      </div>
      <div>
        <input
          name="kraPin"
          value={data.kraPin || ''}
          onChange={e => update({ kraPin: e.target.value })}
          placeholder="KRA PIN"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.kraPin && <p className="text-red-600 text-sm">{errors.kraPin}</p>}
      </div>
    </div>
  );
}
