export interface SpookyJoke {
    setup: string;
    delivery: string;
    id: number;
}

export async function fetchSpookyJoke(): Promise<SpookyJoke> {
    try {
        const response = await fetch("https://v2.jokeapi.dev/joke/Spooky?type=twopart");
        if (!response.ok) {
            throw new Error('fetch error status: ${response.status}');
        }
        const data = await response.json();        
        const joke: SpookyJoke = {
            id:data.id,
            setup: data.setup,
            delivery: data.delivery
        }
        return joke;
    } catch (error) {
        throw error;
    }
      
};
