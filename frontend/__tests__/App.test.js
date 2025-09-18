// __tests__/App.test.js
import { render } from '@testing-library/react-native';
import App from '../App';

describe('Expo App', () => {
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('renders without crashing and logs no errors or warnings', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
