import { getJoke } from "./client";

test("fetches a joke", async () => {
    const joke = await getJoke();
    expect(joke).toHaveProperty("joke");
    console.log(joke)
});
