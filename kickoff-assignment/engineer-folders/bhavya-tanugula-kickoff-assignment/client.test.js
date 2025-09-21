import fetchAdvice from "./client";

test("fetches a random cat", async () => {
    const fact = await fetchAdvice();
    expect(fact).toHaveProperty("advice");
    expect(fact).toHaveProperty("id");
});
