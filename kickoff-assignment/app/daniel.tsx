import * as React from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import FactCard from '../engineer-folders/daniel-wang-kickoff-assignment/FactCard';
import type { UselessFact } from '../engineer-folders/daniel-wang-kickoff-assignment/client';
import { getRandomFact } from '../engineer-folders/daniel-wang-kickoff-assignment/client';

function DanielPage() {
  const [facts, setFacts] = useState<UselessFact[]>([]);

  useEffect(() => {
    const fetchFacts = async () => {
      for (let i = 0; i < 5; i++) {
        const newFact = await getRandomFact();
        if (newFact) {
          setFacts((prevFacts) => [...prevFacts, newFact]);
        }
      }
    };

    fetchFacts();
  }, []);

  return (
    <ScrollView>
      <View>
        {facts.map((fact) => (
          <FactCard key={fact.id} fact={fact} />
        ))}
      </View>
    </ScrollView>
  );
}

export default DanielPage;
