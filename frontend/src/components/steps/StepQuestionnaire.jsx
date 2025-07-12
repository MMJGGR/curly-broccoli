import { useEffect, useState } from 'react';

export default function StepQuestionnaire({ data, update, validate }) {
  const questions = Array.from({ length: 8 }, (_, i) => `Q${i + 1}`);
  const [error, setError] = useState('');

  const handleChange = (index, value) => {
    const q = { ...(data.questionnaire || {}) };
    q[index] = value;
    update({ questionnaire: q });
  };

  useEffect(() => {
    const allAnswered = questions.every((_, i) => (data.questionnaire || {})[i]);
    if (!allAnswered) {
      setError('Please answer all questions');
    } else {
      setError('');
    }
    validate(allAnswered);
  }, [data, validate]);

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="flex items-center space-x-2">
          <span className="flex-1">{q}</span>
          {[1,2,3,4,5].map(v => (
            <label key={v} className="inline-flex items-center">
              <input type="radio" name={`q${i}`} value={v} checked={(data.questionnaire||{})[i]===v} onChange={() => handleChange(i, v)} className="ml-2" />
              <span className="ml-1">{v}</span>
            </label>
          ))}
        </div>
      ))}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
