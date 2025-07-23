import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MainAppLayout from '../MainAppLayout';

// drive routing via BottomNavBar

test('bottom nav navigates between routes', async () => {
  render(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <Routes>
        <Route path="/app/*" element={<MainAppLayout />} />
      </Routes>
    </MemoryRouter>
  );
  // initial dashboard
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /profile/i }));
  expect(screen.getByText(/your profile/i)).toBeInTheDocument();
});
