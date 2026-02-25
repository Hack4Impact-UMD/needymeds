import { getMeowFacts } from './client';

test("fetches a random meow fact", async () => {
  const fact = await getMeowFacts();

  expect(fact).toBeDefined();
  expect(typeof fact).toBe("string");
  expect(fact.length).toBeGreaterThan(0);
});