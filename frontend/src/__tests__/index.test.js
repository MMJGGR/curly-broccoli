import * as reactDom from 'react-dom/client';

jest.mock('react-dom/client');

test('index renders without crashing', () => {
  document.body.innerHTML = '<div id="root"></div>';
  const render = jest.fn();
  reactDom.createRoot.mockReturnValue({ render });
  require('../index');
  expect(reactDom.createRoot).toHaveBeenCalled();
  expect(render).toHaveBeenCalled();
});
