import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { getJoke } from '../engineer-folders/reza-jalil-kickoff-assignment/client';
import JokeCard from '../engineer-folders/reza-jalil-kickoff-assignment/Joke';

export default function RezaPage() {
  const [jokes, setJokes] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const results: string[] = [];

        for (let i = 0; i < 5; i++) {
          const j = await getJoke();
          results.push(j.joke);
        }

        setJokes(results);
      } catch {
        setError('Could not load jokes.');
      }
    }

    load();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      
      {error ? <Text style={{ color: 'black' }}>{error}</Text> : null}

      {jokes.map((j, i) => (
        <JokeCard key={i} joke={j} />
      ))}
    </ScrollView>
  );
}
