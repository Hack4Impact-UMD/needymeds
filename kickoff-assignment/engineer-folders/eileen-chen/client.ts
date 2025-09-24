export interface Joke {
    joke: string;
}

export async function getJoke(): Promise<Joke> {
    const url = "https://v2.jokeapi.dev/joke/Any?type=single";
    const response = await fetch(url);
  
    const result = await response.json();
    return { joke: result.joke }
}