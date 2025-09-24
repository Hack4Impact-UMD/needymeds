// JokeAPI's json format for one-liner jokes
export default interface Joke {
    joke: string
}

// fetches the data from the JokeAPI
export async function getJoke() {
    // filtered URL for only one liner jokes
    const url = "https://v2.jokeapi.dev/joke/Any?type=single";

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    
    const joke = await response.json();
    if (joke.error) {
        console.log(joke.message);
    }

    return joke;
}