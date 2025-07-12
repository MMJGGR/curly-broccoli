import { render, screen } from "@testing-library/react";
import StepQuestionnaire from "../StepQuestionnaire";

test("renders questions and requires answers", () => {
  const validate = jest.fn();
  render(<StepQuestionnaire data={{}} update={() => {}} validate={validate} />);
  expect(screen.getByText("Q1")).toBeInTheDocument();
  expect(validate).toHaveBeenCalledWith(false);
});
