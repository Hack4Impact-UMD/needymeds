import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import FactCard from "../engineer-folders/samarth-kolanupaka/FactCard";
import { getData } from "../engineer-folders/samarth-kolanupaka/client"; 
import type { Fact } from "../engineer-folders/samarth-kolanupaka/client";

function SamarthPage() {
  const [facts, setFacts] = useState<Fact[]>([]);

  useEffect(() => {
    const fetchFacts = async () => {
      const newFact = await getData();
      if (newFact) {
        setFacts((prevFacts) => [...prevFacts, newFact]); 
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

export default SamarthPage;
