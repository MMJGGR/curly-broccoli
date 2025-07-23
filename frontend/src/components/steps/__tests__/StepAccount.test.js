import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import StepAccount from '../StepAccount';

test('StepAccount validation', async () => {
  const validate = jest.fn();
  function Wrapper() {
    const [data, setData] = useState({});
    return (
      <StepAccount
        data={data}
        update={(v) => setData((d) => ({ ...d, ...v }))}
        validate={validate}
      />
    );
  }
  render(<Wrapper />);
  expect(validate).toHaveBeenLastCalledWith(false);
  await userEvent.type(screen.getByPlaceholderText('Email'), 'me@example.com');
  await userEvent.type(screen.getByPlaceholderText('Password'), 'secret');
  await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'secret');
  // wait for effect
  await new Promise((r) => setTimeout(r, 0));
  expect(validate).toHaveBeenLastCalledWith(true);
});
