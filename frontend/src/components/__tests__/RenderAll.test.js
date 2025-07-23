import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountsTransactions from '../AccountsTransactions';
import AdviceModuleDetail from '../AdviceModuleDetail';
import AdvisorDashboard from '../AdvisorDashboard';
import AdvisorLogin from '../AdvisorLogin';
import AuthScreen from '../AuthScreen';
import BalanceSheet from '../BalanceSheet';
import BottomNavBar from '../BottomNavBar';
import ClientList from '../ClientList';
import ClientProfile from '../ClientProfile';
import Dashboard from '../Dashboard';
import DebtRepaymentPlanner from '../DebtRepaymentPlanner';
import FIRECalculator from '../FIRECalculator';
import GoalsOverview from '../GoalsOverview';
import LifetimeJourneyTimeline from '../LifetimeJourneyTimeline';
import MainAppLayout from '../MainAppLayout';
import MessageBox from '../MessageBox';
import MonteCarloSimulation from '../MonteCarloSimulation';
import Onboarding from '../Onboarding';
import OnboardingCashFlowSetup from '../OnboardingCashFlowSetup';
import OnboardingDataConnection from '../OnboardingDataConnection';
import OnboardingWizard from '../OnboardingWizard';
import PersonalDetailsForm from '../PersonalDetailsForm';
import Profile from '../Profile';
import RiskQuestionnaire from '../RiskQuestionnaire';
import UserDashboard from '../UserDashboard';

const components = [
  { Comp: AccountsTransactions, props: { onNextScreen: () => {} } },
  { Comp: AdviceModuleDetail, props: { onNextScreen: () => {} } },
  { Comp: AdvisorDashboard, props: { onNextScreen: () => {} } },
  { Comp: AdvisorLogin, props: { onNextScreen: () => {} } },
  { Comp: AuthScreen, props: { onNextScreen: () => {} } },
  { Comp: BalanceSheet, props: {} },
  { Comp: BottomNavBar, props: { onTabClick: () => {} } },
  { Comp: ClientList, props: { onNextScreen: () => {} } },
  { Comp: ClientProfile, props: { onNextScreen: () => {} } },
  { Comp: Dashboard, props: {} },
  { Comp: DebtRepaymentPlanner, props: { onNextScreen: () => {} } },
  { Comp: FIRECalculator, props: { onNextScreen: () => {} } },
  { Comp: GoalsOverview, props: { onNextScreen: () => {} } },
  { Comp: LifetimeJourneyTimeline, props: { onNextScreen: () => {} } },
  { Comp: MainAppLayout, props: {} },
  { Comp: MessageBox, props: { message: 'msg', onClose: () => {} } },
  { Comp: MonteCarloSimulation, props: { onNextScreen: () => {} } },
  { Comp: Onboarding, props: { onNextScreen: () => {} } },
  { Comp: OnboardingCashFlowSetup, props: {} },
  { Comp: OnboardingDataConnection, props: {} },
  { Comp: OnboardingWizard, props: {} },
  { Comp: PersonalDetailsForm, props: {} },
  { Comp: Profile, props: { onNextScreen: () => {} } },
  { Comp: RiskQuestionnaire, props: {} },
  { Comp: UserDashboard, props: { onNextScreen: () => {} } },
];

test('all components render without crashing', () => {
  components.forEach(({ Comp, props }) => {
    render(
      <MemoryRouter>
        <Comp {...props} />
      </MemoryRouter>
    );
  });
});
