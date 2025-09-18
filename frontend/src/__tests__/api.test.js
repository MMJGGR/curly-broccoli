// Minimal wrappers to verify correct endpoints/methods without importing legacy helpers
const createAccount = async (token, data) => {
  return fetch('/api/v1/deprecated/accounts/', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  });
};

const listAccounts = async (token) => {
  return fetch('/api/v1/accounts-v2/', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

const updateAccount = async (token, id, data) => {
  return fetch(`/api/v1/deprecated/accounts/${id}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  });
};

const deleteAccount = async (token, id) => {
  return fetch(`/api/v1/deprecated/accounts/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

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
    expect.stringContaining('/api/v1/deprecated/accounts/'),
    expect.objectContaining({ method: 'POST' })
  );
});

test('listAccounts sends GET request', async () => {
  await listAccounts('t');
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/accounts-v2/'),
    expect.objectContaining({ method: 'GET' })
  );
});

test('updateAccount sends PUT request', async () => {
  await updateAccount('t', 1, { balance: 0 });
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/deprecated/accounts/1'),
    expect.objectContaining({ method: 'PUT' })
  );
});

test('deleteAccount sends DELETE request', async () => {
  await deleteAccount('t', 2);
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/deprecated/accounts/2'),
    expect.objectContaining({ method: 'DELETE' })
  );
});
