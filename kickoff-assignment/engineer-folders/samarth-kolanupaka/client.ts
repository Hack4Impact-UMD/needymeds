export interface Fact {
    id: string;
    text: string;
    source: string;
    source_url: string;
    language: string;
    permalink: string;
}



export async function getData(): Promise<Fact | void> {
  const url = "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result: Fact = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error((error as Error).message);
  }
}