import { fetchSpookyJoke } from "./client";


describe('fetchSpookyJoke', () => {
    test('should fetch a joke with id, setup, and delivery', async () => {
    const joke = await fetchSpookyJoke();
  		expect(joke).toHaveProperty("id");
        expect(joke).toHaveProperty("setup");
        expect(joke).toHaveProperty("delivery");

        expect(typeof joke.id).toBe("number");
        expect(typeof joke.setup).toBe("string");
        expect(typeof joke.delivery).toBe("string");
    });
  });