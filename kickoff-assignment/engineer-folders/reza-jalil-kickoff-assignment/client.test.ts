import { getJoke } from './client';

test('fetches a joke', async () => {
  const data = await getJoke();

  expect(data).toHaveProperty('joke');
  expect(typeof data.joke).toBe('string');
  expect(data.joke.length).toBeGreaterThan(0);
});
