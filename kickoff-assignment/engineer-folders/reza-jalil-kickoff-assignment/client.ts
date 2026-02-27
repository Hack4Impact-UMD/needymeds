export interface Joke {
  joke: string;
}

export async function getJoke(): Promise<Joke> {
  const url = "https://v2.jokeapi.dev/joke/Any?type=single";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    return { joke: result.joke };
  } 
  catch (error: any) {
    console.error(error?.message ?? error);
    throw error;
  }
}