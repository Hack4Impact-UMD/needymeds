import { getJoke } from "./client";

test("Gets a one-liner joke", async () => {
    const joke = await getJoke();
    expect(joke).toHaveProperty("joke");
});