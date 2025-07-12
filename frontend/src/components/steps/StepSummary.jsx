import { useEffect } from 'react';

export default function StepSummary({ data, validate }) {
  useEffect(() => {
    validate(true);
  }, [validate]);

  return (
    <pre className="bg-gray-200 p-4 rounded-lg text-sm overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
