export default function StepSummary({ data }) {
  return (
    <pre className="bg-gray-200 p-4 rounded-lg text-sm overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
