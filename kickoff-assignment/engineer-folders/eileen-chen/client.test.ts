import { getJoke } from "./client";

test("basic functionality, returns joke", async () => {
    const joke = await getJoke();
    expect(joke).toHaveProperty("joke");
    console.log(joke)
});
