import { getRandomFact } from './client';

test('fetches a random useless fact', async () => {
  const fact = await getRandomFact();

  expect(fact).toHaveProperty('id');
  expect(fact).toHaveProperty('text');
  expect(fact).toHaveProperty('source');
  expect(fact).toHaveProperty('source_url');
  expect(fact).toHaveProperty('language');
  expect(fact).toHaveProperty('permalink');
});
