import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { getMeowFacts } from "../engineer-folders/charu-mehta-kickoff-assignment/client";
import FactCard from "../engineer-folders/charu-mehta-kickoff-assignment/FactCard";

function CharuPage() {
  const [facts, setFacts] = useState<string[]>([]);

  useEffect(() => {
    async function fetchFacts() {
      const data = await getMeowFacts(5);
      setFacts(data);
    }

    fetchFacts();
  }, []); 

  return (
    <ScrollView>
      {facts.map((fact, index) => (
        <FactCard key={index} fact={fact} />
      ))}
    </ScrollView>
  );
}

export default CharuPage;