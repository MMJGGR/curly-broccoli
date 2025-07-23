import {
  createAccount,
  listAccounts,
  updateAccount,
  deleteAccount,
} from '../api';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  );
});

afterEach(() => {
  fetch.mockClear();
});

test('createAccount sends POST request', async () => {
  await createAccount('t', { name: 'A' });
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/accounts/'),
    expect.objectContaining({ method: 'POST' })
  );
});

test('listAccounts sends GET request', async () => {
  await listAccounts('t');
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/accounts/'),
    expect.objectContaining({ method: 'GET' })
  );
});

test('updateAccount sends PUT request', async () => {
  await updateAccount('t', 1, { balance: 0 });
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/accounts/1'),
    expect.objectContaining({ method: 'PUT' })
  );
});

test('deleteAccount sends DELETE request', async () => {
  await deleteAccount('t', 2);
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/accounts/2'),
    expect.objectContaining({ method: 'DELETE' })
  );
});
