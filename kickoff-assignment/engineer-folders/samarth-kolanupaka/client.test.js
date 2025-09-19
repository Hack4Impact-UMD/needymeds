import { getData } from "./client"

test("fetches a random fact", async () => {
  const fact = await getData();

  if (fact) {
    expect(fact).toHaveProperty("id");
    expect(fact).toHaveProperty("text");
    expect(fact).toHaveProperty("source");
    expect(fact).toHaveProperty("source_url");
    expect(fact).toHaveProperty("language");
    expect(fact).toHaveProperty("permalink");
  }
});
