import { getRandomAdvice } from "./client";

describe("getRandomAdvice", () => {
  test("fetches a random advice object with id and advice", async () => {
    const advice = await getRandomAdvice();

    expect(advice).toHaveProperty("id");
    expect(advice).toHaveProperty("advice");

    expect(typeof advice.id).toBe("number");
    expect(typeof advice.advice).toBe("string");
  });
});
