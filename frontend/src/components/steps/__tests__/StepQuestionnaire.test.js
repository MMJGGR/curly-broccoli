import { render, screen } from "@testing-library/react";
import StepQuestionnaire from "../StepQuestionnaire";
import { RISK_QUESTIONS } from "../risk-config";

test("renders questions", () => {
  render(<StepQuestionnaire data={{}} update={() => {}} next={() => {}} />);
  expect(screen.getByText(RISK_QUESTIONS[0])).toBeInTheDocument();
});
