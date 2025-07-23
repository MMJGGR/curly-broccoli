import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AccountsTransactions from '../AccountsTransactions';
import AdviceModuleDetail from '../AdviceModuleDetail';
import AdvisorLogin from '../AdvisorLogin';
import BalanceSheet from '../BalanceSheet';
import ClientList from '../ClientList';
import ClientProfile from '../ClientProfile';
import GoalsOverview from '../GoalsOverview';
import LifetimeJourneyTimeline from '../LifetimeJourneyTimeline';
import MonteCarloSimulation from '../MonteCarloSimulation';
import Profile from '../Profile';

const cases = [
  [AccountsTransactions, /link new account/i],
  [AdviceModuleDetail, /generate email template/i],
  [AdvisorLogin, /forgot password/i],
  [BalanceSheet, /explore net worth projection/i],
  [ClientList, /add new client/i],
  [ClientProfile, /view full financials/i],
  [GoalsOverview, /add new goal/i],
  [LifetimeJourneyTimeline, /add custom milestone/i],
  [MonteCarloSimulation, /run simulation/i],
  [Profile, /change password/i],
];

describe('message components', () => {
  cases.forEach(([Comp, text]) => {
    test(`${Comp.name} triggers MessageBox`, async () => {
      render(
        <MemoryRouter>
          <Comp onNextScreen={() => {}} />
        </MemoryRouter>
      );
      const btn =
        screen.queryByRole('button', { name: text }) ||
        screen.getByRole('link', { name: text });
      await userEvent.click(btn);
      expect(screen.getByText(/wireframe action/i)).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /ok/i }));
      expect(screen.queryByText(/wireframe action/i)).not.toBeInTheDocument();
    });
  });
});
