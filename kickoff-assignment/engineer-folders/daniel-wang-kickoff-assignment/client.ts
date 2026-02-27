export interface UselessFact {
  id: string;
  text: string;
  source: string;
  source_url: string;
  language: string;
  permalink: string;
}

export async function getRandomFact(): Promise<UselessFact> {
  const url = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const result: UselessFact = await response.json();
  return result;
}
