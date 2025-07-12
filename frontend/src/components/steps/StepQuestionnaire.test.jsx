import { render, fireEvent } from '@testing-library/react';
import StepQuestionnaire from './StepQuestionnaire';

test('updates questionnaire answers', () => {
  const update = jest.fn();
  const { getByLabelText } = render(<StepQuestionnaire data={{}} update={update} />);
  fireEvent.click(getByLabelText('1', { selector: 'input[name="q0"]' }));
  expect(update).toHaveBeenCalledWith({ questionnaire: { 0: 1 } });
});
