export default function StepQuestionnaire({ data, update }) {
  const questions = Array.from({ length: 8 }, (_, i) => `Q${i + 1}`);

  const handleChange = (index, value) => {
    const q = { ...(data.questionnaire || {}) };
    q[index] = value;
    update({ questionnaire: q });
  };

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
    </div>
  );
}
