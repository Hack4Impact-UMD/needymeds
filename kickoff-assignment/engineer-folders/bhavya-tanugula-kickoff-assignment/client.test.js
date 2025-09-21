import fetchAdvice from "./client";

test("fetches a piece of advice", async () => {
    const fact = await fetchAdvice();
    expect(fact).toHaveProperty("advice");
    expect(fact).toHaveProperty("id");
});
