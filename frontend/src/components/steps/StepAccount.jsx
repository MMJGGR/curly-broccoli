import { useEffect, useState } from "react";

export default function StepAccount({ data, update, validate }) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const errs = {};
    if (!data.email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = "Invalid email";
    }
    if (!data.password || data.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (data.password !== data.confirmPassword) {
      errs.confirmPassword = "Passwords must match";
    }
    setErrors(errs);
    validate(Object.keys(errs).length === 0);
  }, [data, validate]);

  return (
    <div className="space-y-2">
      <div>
        <input
          name="email"
          type="email"
          value={data.email || ""}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="Email"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>
      <div>
        <input
          name="password"
          type="password"
          value={data.password || ""}
          onChange={(e) => update({ password: e.target.value })}
          placeholder="Password"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.password && (
          <p className="text-red-600 text-sm">{errors.password}</p>
        )}
      </div>
      <div>
        <input
          name="confirmPassword"
          type="password"
          value={data.confirmPassword || ""}
          onChange={(e) => update({ confirmPassword: e.target.value })}
          placeholder="Confirm Password"
          className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-lg p-2 w-full"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}
