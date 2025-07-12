import { render, screen } from "@testing-library/react";
import StepPersonal from "../StepPersonal";

test("shows required errors when empty", () => {
  const validate = jest.fn();
  render(<StepPersonal data={{}} update={() => {}} validate={validate} />);
  expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
  expect(validate).toHaveBeenCalledWith(false);
});
