import { render, screen } from "@testing-library/react";
import StepSummary from "../StepSummary";

test("renders summary of data", () => {
  const validate = jest.fn();
  render(<StepSummary data={{ foo: "bar" }} validate={validate} />);
  expect(screen.getByText(/foo/)).toBeInTheDocument();
  expect(validate).toHaveBeenCalledWith(true);
});
