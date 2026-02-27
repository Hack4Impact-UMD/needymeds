export interface MeowFactResponse {
  data: string[];
}

export async function getMeowFacts(count: number = 3): Promise<string[]> {
  const response = await fetch(
    `https://meowfacts.herokuapp.com/?count=${count}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch fact");
  }

  const data: MeowFactResponse = await response.json();
  return data.data;
}